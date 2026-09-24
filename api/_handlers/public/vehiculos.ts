/**
 * GET /api/public/vehiculos — sin autenticación: patinetas y carros
 * publicados, en el orden del panel. Si falla, la web sigue con los dos carros
 * de siempre (ver src/lib/vehiculos-live.tsx).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql`
      select id, tipo, name, detail, price, old_price, on_sale, images, description, range, speed
      from vehiculos where published = true order by tipo, orden, created_at
    `
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, vehiculos: rows })
  } catch (e) {
    console.error('public/vehiculos', e)
    return res.status(500).json({ ok: false })
  }
}
