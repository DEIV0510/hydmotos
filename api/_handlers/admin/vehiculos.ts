/**
 * GET    /api/admin/vehiculos       → patinetas y carros, publicados u ocultos (protegido)
 * POST   /api/admin/vehiculos       → crea uno (protegido)
 * PATCH  /api/admin/vehiculos       → lo edita (protegido)
 * DELETE /api/admin/vehiculos?id=…  → lo elimina (protegido)
 *
 * El cliente pidió tener Patinetas y Carros en el panel (nota de voz, 23/09).
 * Una sola tabla con `tipo`, porque los campos son los mismos.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../../_lib/auth.js'
import {
  enteroOpcional,
  idSeguro,
  idUnico,
  leerImagenes,
  precioValido,
  textoOpcional,
  TIPOS_VEHICULO,
  type Imagen,
} from '../../_lib/productos.js'

type FilaVehiculo = {
  id: string
  tipo: string
  name: string
  detail: string | null
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  images: Imagen[]
  description: string | null
  range: number | null
  speed: number | null
  orden: number
  updated_at: string
}

type DatosVehiculo = {
  tipo: string
  name: string
  detail: string | null
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  images: Imagen[]
  description: string | null
  range: number | null
  speed: number | null
  orden: number | null
}

function leerVehiculo(b: Record<string, unknown>): DatosVehiculo | { error: string } {
  if (typeof b.tipo !== 'string' || !TIPOS_VEHICULO.has(b.tipo)) return { error: 'Tipo de vehículo no válido.' }
  if (typeof b.name !== 'string' || !b.name.trim()) return { error: 'El nombre es obligatorio.' }
  const price = b.price ?? null
  const oldPrice = b.oldPrice ?? null
  if (!precioValido(price) || !precioValido(oldPrice)) {
    return { error: 'El precio debe ser un número entero positivo.' }
  }
  const images = leerImagenes(b.images ?? [])
  if (!images) return { error: 'Las fotos no son válidas (máximo 12).' }
  return {
    tipo: b.tipo,
    name: b.name.trim(),
    detail: textoOpcional(b.detail),
    price,
    oldPrice,
    onSale: b.onSale === true,
    published: b.published !== false,
    images,
    description: textoOpcional(b.description),
    range: enteroOpcional(b.range),
    speed: enteroOpcional(b.speed),
    orden: enteroOpcional(b.orden),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method === 'GET') {
    const { rows } = await sql<FilaVehiculo>`select * from vehiculos order by tipo, orden, created_at`
    return res.status(200).json({ ok: true, vehiculos: rows })
  }

  if (req.method === 'POST') {
    const d = leerVehiculo((req.body ?? {}) as Record<string, unknown>)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })

    const existentes = new Set((await sql<{ id: string }>`select id from vehiculos`).rows.map((r) => r.id))
    const id = idUnico(idSeguro(`${d.tipo}-${d.name}`), existentes)
    // Sin orden explícito, va al final de su sección
    const orden =
      d.orden ??
      (await sql<{ siguiente: number }>`select coalesce(max(orden), -1) + 1 as siguiente from vehiculos where tipo = ${d.tipo}`)
        .rows[0].siguiente

    await sql`
      insert into vehiculos (
        id, tipo, name, detail, price, old_price, on_sale, published, images, description, range, speed, orden
      ) values (
        ${id}, ${d.tipo}, ${d.name}, ${d.detail}, ${d.price}, ${d.oldPrice}, ${d.onSale}, ${d.published},
        ${JSON.stringify(d.images)}, ${d.description}, ${d.range}, ${d.speed}, ${orden}
      )
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'create_vehiculo', ${JSON.stringify({ id, tipo: d.tipo, name: d.name })})
    `
    return res.status(200).json({ ok: true, id, orden })
  }

  if (req.method === 'PATCH') {
    const b = (req.body ?? {}) as Record<string, unknown>
    const id = typeof b.id === 'string' ? b.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })

    const antes = (await sql<FilaVehiculo>`select * from vehiculos where id = ${id}`).rows[0]
    if (!antes) return res.status(404).json({ ok: false, error: 'Ese vehículo no existe.' })

    const d = leerVehiculo(b)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })

    await sql`
      update vehiculos set
        name = ${d.name},
        detail = ${d.detail},
        price = ${d.price},
        old_price = ${d.oldPrice},
        on_sale = ${d.onSale},
        published = ${d.published},
        images = ${JSON.stringify(d.images)},
        description = ${d.description},
        range = ${d.range},
        speed = ${d.speed},
        orden = ${d.orden ?? antes.orden},
        updated_at = now()
      where id = ${id}
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_vehiculo', ${JSON.stringify({ id, antes, despues: d })})
    `
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })
    const { rowCount } = await sql`delete from vehiculos where id = ${id}`
    if (!rowCount) return res.status(404).json({ ok: false, error: 'Ese vehículo no existe.' })
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'delete_vehiculo', ${JSON.stringify({ id })})
    `
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
