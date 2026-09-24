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
import { sesionDeLaPeticion } from '../../_lib/auth.js'
import { MOTOS } from '../../../src/data/motos.js'
import {
  CATEGORIAS_MOTO,
  enteroOpcional,
  idSeguro,
  idUnico,
  imagenValida,
  precioValido,
  textoOpcional,
} from '../../_lib/productos.js'

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

type DatosMoto = {
  name: string
  category: string
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
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
}

/** Crear y editar validan igual: o un error para mostrar, o los datos ya con su tipo */
function leerMoto(b: Record<string, unknown>): DatosMoto | { error: string } {
  if (typeof b.name !== 'string' || !b.name.trim()) return { error: 'El nombre es obligatorio.' }
  if (typeof b.category !== 'string' || !CATEGORIAS_MOTO.has(b.category)) {
    return { error: 'Elige una categoría válida.' }
  }
  const price = b.price ?? null
  const oldPrice = b.oldPrice ?? null
  if (!precioValido(price) || !precioValido(oldPrice)) {
    return { error: 'El precio debe ser un número entero positivo.' }
  }
  return {
    name: b.name.trim(),
    category: b.category,
    price,
    oldPrice,
    onSale: b.onSale === true,
    published: b.published !== false,
    range: enteroOpcional(b.range),
    speed: enteroOpcional(b.speed),
    power: enteroOpcional(b.power),
    battery: textoOpcional(b.battery),
    capacity: textoOpcional(b.capacity),
    brakes: textoOpcional(b.brakes),
    description: textoOpcional(b.description),
    soat: b.soat === true,
    matricula: b.matricula === true,
    tecnomecanica: b.tecnomecanica === true,
  }
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
    const d = leerMoto(b)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })
    if (!imagenValida(b.image)) return res.status(400).json({ ok: false, error: 'Imagen no válida.' })
    const image = b.image ?? null

    const idsExistentes = new Set([
      ...MOTOS.map((m) => m.id),
      ...(await sql<{ id: string }>`select id from custom_motos`).rows.map((r) => r.id),
    ])
    const id = idUnico(idSeguro(d.name), idsExistentes)

    await sql`
      insert into custom_motos (
        id, name, category, price, old_price, on_sale, published, image,
        range, speed, power, battery, capacity, brakes, description,
        soat, matricula, tecnomecanica
      ) values (
        ${id}, ${d.name}, ${d.category}, ${d.price}, ${d.oldPrice}, ${d.onSale}, ${d.published}, ${image},
        ${d.range}, ${d.speed}, ${d.power}, ${d.battery}, ${d.capacity}, ${d.brakes}, ${d.description},
        ${d.soat}, ${d.matricula}, ${d.tecnomecanica}
      )
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'create_moto', ${JSON.stringify({ id, name: d.name })})
    `
    return res.status(200).json({ ok: true, id })
  }

  if (req.method === 'PATCH') {
    const b = (req.body ?? {}) as Record<string, unknown>
    const id = typeof b.id === 'string' ? b.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })

    const antes = (await sql<FilaCustomMoto>`select * from custom_motos where id = ${id}`).rows[0]
    if (!antes) return res.status(404).json({ ok: false, error: 'Esa moto no existe.' })

    const d = leerMoto(b)
    if ('error' in d) return res.status(400).json({ ok: false, error: d.error })
    if (!imagenValida(b.image)) return res.status(400).json({ ok: false, error: 'Imagen no válida.' })
    // undefined = no se tocó la imagen en el formulario: se conserva la que había
    const image = b.image === undefined ? antes.image : b.image

    await sql`
      update custom_motos set
        name = ${d.name},
        category = ${d.category},
        price = ${d.price},
        old_price = ${d.oldPrice},
        on_sale = ${d.onSale},
        published = ${d.published},
        image = ${image},
        range = ${d.range},
        speed = ${d.speed},
        power = ${d.power},
        battery = ${d.battery},
        capacity = ${d.capacity},
        brakes = ${d.brakes},
        description = ${d.description},
        soat = ${d.soat},
        matricula = ${d.matricula},
        tecnomecanica = ${d.tecnomecanica},
        updated_at = now()
      where id = ${id}
    `
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_custom_moto', ${JSON.stringify({ id, antes, despues: { ...d, image } })})
    `
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const id = typeof req.query.id === 'string' ? req.query.id : null
    if (!id) return res.status(400).json({ ok: false, error: 'Falta el identificador.' })
    const { rowCount } = await sql`delete from custom_motos where id = ${id}`
    if (!rowCount) return res.status(404).json({ ok: false, error: 'Esa moto no existe.' })
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'delete_custom_moto', ${JSON.stringify({ id })})
    `
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
