/**
 * GET /api/public/custom-repuestos — sin autenticación: repuestos creados
 * desde el panel. Solo los publicados. Mismo patrón que custom-motos.ts.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

type Fila = {
  id: string
  name: string
  category: string
  sub: string | null
  sku: string | null
  icon: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  image: string | null
  description: string | null
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql<Fila>`select * from custom_repuestos where published = true order by created_at desc`
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, repuestos: rows })
  } catch (e) {
    console.error('public/custom-repuestos', e)
    return res.status(500).json({ ok: false })
  }
}
