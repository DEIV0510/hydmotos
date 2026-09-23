/**
 * GET    /api/admin/custom-repuestos       → repuestos creados desde el panel (protegido)
 * POST   /api/admin/custom-repuestos       → crea un repuesto nuevo (protegido)
 * PATCH  /api/admin/custom-repuestos       → edita un repuesto creado desde el panel (protegido)
 * DELETE /api/admin/custom-repuestos?id=…  → lo elimina (protegido)
 *
 * Mismo patrón que custom-motos.ts: repuestos.ts (generado) no se toca.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../_lib/auth.js'
import { REPUESTOS } from '../../src/data/repuestos.js'
import { ICONOS_REPUESTO, idSeguro, idUnico, precioValido, textoOpcional } from '../_lib/productos.js'

type FilaCustomRepuesto = {
  id: string
  name: string
  category: string
  sub: string | null
  sku: string | null
  icon: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  image: string | null
  description: string | null
  updated_at: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method === 'GET') {
    const { rows } = await sql<FilaCustomRepuesto>`select * from custom_repuestos order by created_at desc`
    return res.status(200).json({ ok: true, repuestos: rows })
  }

  if (req.method === 'POST') {
    const b = (req.body ?? {}) as Record<string, unknown>

    if (typeof b.name !== 'string' || !b.name.trim()) {
      return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' })
    }
    if (typeof b.category !== 'string' || !b.category.trim()) {
      return res.status(400).json({ ok: false, error: 'La categoría es obligatoria.' })
    }
    const icon = typeof b.icon === 'string' && ICONOS_REPUESTO.has(b.icon) ? b.icon : 'tools'
    if (!precioValido(b.price ?? null) || !precioValido(b.oldPrice ?? null)) {
      return res.status(400).json({ ok: false, error: 'El precio debe ser un número entero positivo.' })
    }

    const idsExistentes = new Set([
      ...REPUESTOS.map((r) => r.id),
      ...(await sql<{ id: string }>`select id from custom_repuestos`).rows.map((r) => r.id),
    ])
    const id = idUnico(idSeguro(b.name as string), idsExistentes)

    await sql`
      insert into custom_repuestos (
        id, name, category, sub, sku, icon, price, old_price, on_sale, published, image, description
      ) values (
        ${id}, ${(b.name as string).trim()}, ${(b.category as string).trim()}, ${textoOpcional(b.sub)},
        ${textoOpcional(b.sku)}, ${icon}, ${b.price ?? null}, ${b.oldPrice ?? null},
        ${Boolean(b.onSale)}, ${b.published !== false}, ${textoOpcional(b.image)}, ${textoOpcional(b.description)}
      )
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'create_repuesto', ${JSON.stringify({ id, name: b.name })})
    `
    return res.status(200).json({ ok: true, id })
  }

  if (req.method === 'PATCH') {
    const b = (req.body ?? {}) as Record<string, unknown>
    const id = typeof b.id === 'string' ? b.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })

    const antes = (await sql<FilaCustomRepuesto>`select * from custom_repuestos where id = ${id}`).rows[0]
    if (!antes) return res.status(404).json({ ok: false, error: 'Ese repuesto no existe.' })

    if (typeof b.name !== 'string' || !b.name.trim()) {
      return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' })
    }
    if (typeof b.category !== 'string' || !b.category.trim()) {
      return res.status(400).json({ ok: false, error: 'La categoría es obligatoria.' })
    }
    const icon = typeof b.icon === 'string' && ICONOS_REPUESTO.has(b.icon) ? b.icon : antes.icon
    if (!precioValido(b.price ?? null) || !precioValido(b.oldPrice ?? null)) {
      return res.status(400).json({ ok: false, error: 'El precio debe ser un número entero positivo.' })
    }
    const imagenFinal = b.image !== undefined ? textoOpcional(b.image) : antes.image

    await sql`
      update custom_repuestos set
        name = ${(b.name as string).trim()},
        category = ${(b.category as string).trim()},
        sub = ${textoOpcional(b.sub)},
        sku = ${textoOpcional(b.sku)},
        icon = ${icon},
        price = ${b.price ?? null},
        old_price = ${b.oldPrice ?? null},
        on_sale = ${Boolean(b.onSale)},
        published = ${b.published !== false},
        image = ${imagenFinal},
        description = ${textoOpcional(b.description)},
        updated_at = now()
      where id = ${id}
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_custom_repuesto', ${JSON.stringify({ id, antes, despues: b })})
    `
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })
    await sql`delete from custom_repuestos where id = ${id}`
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'delete_custom_repuesto', ${JSON.stringify({ id })})
    `
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
