/**
 * GET /api/public/repuestos-overrides — sin autenticación, mismo patrón que
 * /api/public/motos-overrides.ts: lo consume la web pública para reflejar
 * precio, oferta, publicado/oculto e imagen sin depender del admin.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

type Fila = {
  repuesto_id: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  image: string | null
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql<Fila>`
      select repuesto_id, price, old_price, on_sale, published, image from repuesto_overrides
    `
    const overrides: Record<
      string,
      { price: number | null; oldPrice: number | null; onSale: boolean; published: boolean; image: string | null }
    > = {}
    for (const r of rows) {
      overrides[r.repuesto_id] = {
        price: r.price,
        oldPrice: r.on_sale ? r.old_price : null,
        onSale: r.on_sale,
        published: r.published,
        image: r.image,
      }
    }
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, overrides })
  } catch (e) {
    console.error('repuestos-overrides', e)
    return res.status(500).json({ ok: false })
  }
}
