/**
 * GET   /api/admin/repuestos        → los 135 repuestos con su estado actual (protegido)
 * PATCH /api/admin/repuestos        → cambia precio/oferta/publicado/imagen de uno (protegido)
 *
 * Mismo patrón que /api/admin/motos.ts: la ficha (nombre, categoría, specs...)
 * sigue viniendo del archivo estático generado desde el Excel de la carpeta
 * Motors; precio, precio anterior, oferta, publicado/oculto e imagen viven en
 * `repuesto_overrides`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../../_lib/auth.js'
import { REPUESTOS } from '../../../src/data/repuestos.js'

const PRECIO_MAXIMO = 1_000_000_000

type FilaOverride = {
  repuesto_id: string
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
    const { rows } = await sql<FilaOverride>`select * from repuesto_overrides`
    const porId = new Map(rows.map((r) => [r.repuesto_id, r]))

    const repuestos = REPUESTOS.map((p) => {
      const o = porId.get(p.id)
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        sku: p.sku ?? null,
        image: o?.image ?? p.image ?? null,
        price: o ? o.price : (p.price ?? null),
        oldPrice: o?.on_sale ? o.old_price : null,
        onSale: o ? o.on_sale : Boolean(p.oldPrice),
        published: o ? o.published : true,
        updatedAt: o?.updated_at ?? null,
      }
    })
    return res.status(200).json({ ok: true, repuestos })
  }

  if (req.method === 'PATCH') {
    const { repuestoId, price, oldPrice, onSale, published, image } = (req.body ?? {}) as {
      repuestoId?: string
      price?: number | null
      oldPrice?: number | null
      onSale?: boolean
      published?: boolean
      image?: string | null
    }

    if (typeof repuestoId !== 'string' || !REPUESTOS.some((p) => p.id === repuestoId)) {
      return res.status(400).json({ ok: false, error: 'Ese repuesto no existe en el catálogo.' })
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

    const antes = (await sql<FilaOverride>`select * from repuesto_overrides where repuesto_id = ${repuestoId}`)
      .rows[0]
    const imagenFinal = image !== undefined ? image : (antes?.image ?? null)

    await sql`
      insert into repuesto_overrides (repuesto_id, price, old_price, on_sale, published, image, updated_at)
      values (${repuestoId}, ${price ?? null}, ${oldPrice ?? null}, ${onSale}, ${published}, ${imagenFinal}, now())
      on conflict (repuesto_id) do update set
        price = excluded.price,
        old_price = excluded.old_price,
        on_sale = excluded.on_sale,
        published = excluded.published,
        image = excluded.image,
        updated_at = now()
    `

    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_repuesto', ${JSON.stringify({ repuestoId, antes: antes ?? null, despues: { price, oldPrice, onSale, published, image: imagenFinal } })})
    `

    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
