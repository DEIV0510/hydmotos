/**
 * GET    /api/admin/custom-motos       → motos creadas desde el panel (protegido)
 * POST   /api/admin/custom-motos       → crea una moto nueva (protegido)
 * PATCH  /api/admin/custom-motos       → edita una moto creada desde el panel (protegido)
 * DELETE /api/admin/custom-motos?id=…  → la elimina (protegido)
 *
 * El cliente pidió poder "añadir otras referencias" (nota de voz, 23/09): el
 * catálogo generado (motos.ts) no se toca, esto vive en su propia tabla y se
 * une al catálogo en motos-live.tsx / api/public/custom-motos.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../_lib/auth.js'
import { MOTOS } from '../../src/data/motos.js'
import { CATEGORIAS_MOTO, idSeguro, idUnico, PRECIO_MAXIMO, precioValido, textoOpcional } from '../_lib/productos.js'

type FilaCustomMoto = {
  id: string
  name: string
  category: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  image: string | null
  range: number | null
  speed: number | null
  power: number | null
  battery: string | null
  capacity: string | null
  brakes: string | null
  description: string | null
  soat: boolean
  matricula: boolean
  tecnomecanica: boolean
  updated_at: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method === 'GET') {
    const { rows } = await sql<FilaCustomMoto>`select * from custom_motos order by created_at desc`
    return res.status(200).json({ ok: true, motos: rows })
  }

  if (req.method === 'POST') {
    const b = (req.body ?? {}) as Record<string, unknown>

    if (typeof b.name !== 'string' || !b.name.trim()) {
      return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' })
    }
    if (typeof b.category !== 'string' || !CATEGORIAS_MOTO.has(b.category)) {
      return res.status(400).json({ ok: false, error: 'Elige una categoría válida.' })
    }
    if (!precioValido(b.price ?? null) || !precioValido(b.oldPrice ?? null)) {
      return res.status(400).json({ ok: false, error: 'El precio debe ser un número entero positivo.' })
    }

    const idsExistentes = new Set([
      ...MOTOS.map((m) => m.id),
      ...(await sql<{ id: string }>`select id from custom_motos`).rows.map((r) => r.id),
    ])
    const id = idUnico(idSeguro(b.name as string), idsExistentes)

    await sql`
      insert into custom_motos (
        id, name, category, price, old_price, on_sale, published, image,
        range, speed, power, battery, capacity, brakes, description,
        soat, matricula, tecnomecanica
      ) values (
        ${id}, ${(b.name as string).trim()}, ${b.category}, ${b.price ?? null}, ${b.oldPrice ?? null},
        ${Boolean(b.onSale)}, ${b.published !== false}, ${textoOpcional(b.image)},
        ${Number.isInteger(b.range) ? b.range : null}, ${Number.isInteger(b.speed) ? b.speed : null},
        ${Number.isInteger(b.power) ? b.power : null}, ${textoOpcional(b.battery)}, ${textoOpcional(b.capacity)},
        ${textoOpcional(b.brakes)}, ${textoOpcional(b.description)},
        ${Boolean(b.soat)}, ${Boolean(b.matricula)}, ${Boolean(b.tecnomecanica)}
      )
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'create_moto', ${JSON.stringify({ id, name: b.name })})
    `
    return res.status(200).json({ ok: true, id })
  }

  if (req.method === 'PATCH') {
    const b = (req.body ?? {}) as Record<string, unknown>
    const id = typeof b.id === 'string' ? b.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })

    const antes = (await sql<FilaCustomMoto>`select * from custom_motos where id = ${id}`).rows[0]
    if (!antes) return res.status(404).json({ ok: false, error: 'Esa moto no existe.' })

    if (typeof b.name !== 'string' || !b.name.trim()) {
      return res.status(400).json({ ok: false, error: 'El nombre es obligatorio.' })
    }
    if (typeof b.category !== 'string' || !CATEGORIAS_MOTO.has(b.category)) {
      return res.status(400).json({ ok: false, error: 'Elige una categoría válida.' })
    }
    if (!precioValido(b.price ?? null) || !precioValido(b.oldPrice ?? null)) {
      return res.status(400).json({ ok: false, error: 'El precio debe ser un número entero positivo.' })
    }
    const imagenFinal = b.image !== undefined ? textoOpcional(b.image) : antes.image

    await sql`
      update custom_motos set
        name = ${(b.name as string).trim()},
        category = ${b.category},
        price = ${b.price ?? null},
        old_price = ${b.oldPrice ?? null},
        on_sale = ${Boolean(b.onSale)},
        published = ${b.published !== false},
        image = ${imagenFinal},
        range = ${Number.isInteger(b.range) ? b.range : null},
        speed = ${Number.isInteger(b.speed) ? b.speed : null},
        power = ${Number.isInteger(b.power) ? b.power : null},
        battery = ${textoOpcional(b.battery)},
        capacity = ${textoOpcional(b.capacity)},
        brakes = ${textoOpcional(b.brakes)},
        description = ${textoOpcional(b.description)},
        soat = ${Boolean(b.soat)},
        matricula = ${Boolean(b.matricula)},
        tecnomecanica = ${Boolean(b.tecnomecanica)},
        updated_at = now()
      where id = ${id}
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_custom_moto', ${JSON.stringify({ id, antes, despues: b })})
    `
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })
    await sql`delete from custom_motos where id = ${id}`
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'delete_custom_moto', ${JSON.stringify({ id })})
    `
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
