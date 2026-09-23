/**
 * GET /api/public/custom-motos — sin autenticación: motos creadas desde el
 * panel (no las del catálogo generado, esas van por motos-overrides). Solo
 * las publicadas. Si falla, la web sigue con el catálogo estático de siempre.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

type Fila = {
  id: string
  name: string
  category: string
  price: number | null
  old_price: number | null
  on_sale: boolean
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
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql<Fila>`select * from custom_motos where published = true order by created_at desc`
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, motos: rows })
  } catch (e) {
    console.error('public/custom-motos', e)
    return res.status(500).json({ ok: false })
  }
}
