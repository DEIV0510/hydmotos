/**
 * GET   /api/admin/motos            → las 80 motos con su estado actual (protegido)
 * PATCH /api/admin/motos            → cambia precio/oferta/publicado/imagen de una (protegido)
 *
 * El catálogo (nombre, ficha técnica...) sigue viniendo del archivo estático
 * generado por los scripts de `motors`; lo que vive en la base de datos —y
 * que este panel puede cambiar— es precio, precio anterior, oferta activa,
 * publicado/oculto e imagen principal (Fase 2: sube a Vercel Blob desde
 * /api/admin/upload y aquí solo se guarda la URL resultante).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../../_lib/auth.js'
import { MOTOS } from '../../../src/data/motos.js'

const PRECIO_MAXIMO = 1_000_000_000 // 1.000 millones de COP: tope contra un typo, no un límite real de negocio

type FilaOverride = {
  moto_id: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  image: string | null
  updated_at: string
}

function precioValido(v: unknown): v is number | null {
  return v === null || (typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= PRECIO_MAXIMO)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method === 'GET') {
    const { rows } = await sql<FilaOverride>`select * from moto_overrides`
    const porId = new Map(rows.map((r) => [r.moto_id, r]))

    const motos = MOTOS.map((m) => {
      const o = porId.get(m.id)
      return {
        id: m.id,
        name: m.name,
        image: o?.image ?? m.image ?? null,
        category: m.category,
        range: m.range ?? null,
        speed: m.speed ?? null,
        power: m.power ?? null,
        // Sin fila todavía (modelo nuevo en el catálogo estático): valores del archivo, publicado
        price: o ? o.price : (m.price ?? null),
        oldPrice: o?.on_sale ? o.old_price : null,
        onSale: o ? o.on_sale : Boolean(m.oldPrice),
        published: o ? o.published : true,
        updatedAt: o?.updated_at ?? null,
      }
    })
    return res.status(200).json({ ok: true, motos })
  }

  if (req.method === 'PATCH') {
    const { motoId, price, oldPrice, onSale, published, image } = (req.body ?? {}) as {
      motoId?: string
      price?: number | null
      oldPrice?: number | null
      onSale?: boolean
      published?: boolean
      image?: string | null
    }

    if (typeof motoId !== 'string' || !MOTOS.some((m) => m.id === motoId)) {
      return res.status(400).json({ ok: false, error: 'Ese modelo no existe en el catálogo.' })
    }
    if (!precioValido(price ?? null) || !precioValido(oldPrice ?? null)) {
      return res.status(400).json({ ok: false, error: 'El precio debe ser un número entero positivo.' })
    }
    if (typeof onSale !== 'boolean' || typeof published !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'Faltan datos.' })
    }
    if (image != null && (typeof image !== 'string' || !/^https:\/\//.test(image))) {
      return res.status(400).json({ ok: false, error: 'Imagen no válida.' })
    }

    const antes = (await sql<FilaOverride>`select * from moto_overrides where moto_id = ${motoId}`).rows[0]
    const imagenFinal = image !== undefined ? image : (antes?.image ?? null)

    await sql`
      insert into moto_overrides (moto_id, price, old_price, on_sale, published, image, updated_at)
      values (${motoId}, ${price ?? null}, ${oldPrice ?? null}, ${onSale}, ${published}, ${imagenFinal}, now())
      on conflict (moto_id) do update set
        price = excluded.price,
        old_price = excluded.old_price,
        on_sale = excluded.on_sale,
        published = excluded.published,
        image = excluded.image,
        updated_at = now()
    `

    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_moto', ${JSON.stringify({ motoId, antes: antes ?? null, despues: { price, oldPrice, onSale, published, image: imagenFinal } })})
    `

    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
