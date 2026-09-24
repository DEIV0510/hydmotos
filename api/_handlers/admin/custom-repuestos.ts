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
import { sesionDeLaPeticion } from '../../_lib/auth.js'
import { REPUESTOS } from '../../../src/data/repuestos.js'
import { ICONOS_REPUESTO, idSeguro, idUnico, imagenValida, precioValido, textoOpcional } from '../../_lib/productos.js'

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

type DatosRepuesto = {
  name: string
  category: string
  sub: string | null
  sku: string | null
  icon: string
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  description: string | null
}

function leerRepuesto(b: Record<string, unknown>): DatosRepuesto | { error: string } {
  if (typeof b.name !== 'string' || !b.name.trim()) return { error: 'El nombre es obligatorio.' }
  if (typeof b.category !== 'string' || !b.category.trim()) return { error: 'La categoría es obligatoria.' }
  const price = b.price ?? null
  const oldPrice = b.oldPrice ?? null
  if (!precioValido(price) || !precioValido(oldPrice)) {
    return { error: 'El precio debe ser un número entero positivo.' }
  }
  return {
    name: b.name.trim(),
    category: b.category.trim(),
    sub: textoOpcional(b.sub),
    sku: textoOpcional(b.sku),
    icon: typeof b.icon === 'string' && ICONOS_REPUESTO.has(b.icon) ? b.icon : 'tools',
    price,
    oldPrice,
    onSale: b.onSale === true,
    published: b.published !== false,
    description: textoOpcional(b.description),
  }
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
    const d = leerRepuesto(b)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })
    if (!imagenValida(b.image)) return res.status(400).json({ ok: false, error: 'Imagen no válida.' })
    const image = b.image ?? null

    const idsExistentes = new Set([
      ...REPUESTOS.map((r) => r.id),
      ...(await sql<{ id: string }>`select id from custom_repuestos`).rows.map((r) => r.id),
    ])
    const id = idUnico(idSeguro(d.name), idsExistentes)

    await sql`
      insert into custom_repuestos (
        id, name, category, sub, sku, icon, price, old_price, on_sale, published, image, description
      ) values (
        ${id}, ${d.name}, ${d.category}, ${d.sub}, ${d.sku}, ${d.icon}, ${d.price}, ${d.oldPrice},
        ${d.onSale}, ${d.published}, ${image}, ${d.description}
      )
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'create_repuesto', ${JSON.stringify({ id, name: d.name })})
    `
    return res.status(200).json({ ok: true, id })
  }

  if (req.method === 'PATCH') {
    const b = (req.body ?? {}) as Record<string, unknown>
    const id = typeof b.id === 'string' ? b.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })

    const antes = (await sql<FilaCustomRepuesto>`select * from custom_repuestos where id = ${id}`).rows[0]
    if (!antes) return res.status(404).json({ ok: false, error: 'Ese repuesto no existe.' })

    const d = leerRepuesto(b)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })
    if (!imagenValida(b.image)) return res.status(400).json({ ok: false, error: 'Imagen no válida.' })
    const image = b.image === undefined ? antes.image : b.image

    await sql`
      update custom_repuestos set
        name = ${d.name},
        category = ${d.category},
        sub = ${d.sub},
        sku = ${d.sku},
        icon = ${d.icon},
        price = ${d.price},
        old_price = ${d.oldPrice},
        on_sale = ${d.onSale},
        published = ${d.published},
        image = ${image},
        description = ${d.description},
        updated_at = now()
      where id = ${id}
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_custom_repuesto', ${JSON.stringify({ id, antes, despues: { ...d, image } })})
    `
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })
    const { rowCount } = await sql`delete from custom_repuestos where id = ${id}`
    if (!rowCount) return res.status(404).json({ ok: false, error: 'Ese repuesto no existe.' })
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'delete_custom_repuesto', ${JSON.stringify({ id })})
    `
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
