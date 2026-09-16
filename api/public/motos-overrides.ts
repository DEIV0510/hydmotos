/**
 * GET /api/public/motos-overrides — sin autenticación: lo consume la propia
 * web pública para mostrar los precios y el publicado/oculto que el
 * administrador haya dejado en la base de datos. Sin esto, la web solo vería
 * los valores estáticos con los que se creó el catálogo.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

type Fila = { moto_id: string; price: number | null; old_price: number | null; on_sale: boolean; published: boolean }

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql<Fila>`select moto_id, price, old_price, on_sale, published from moto_overrides`
    const overrides: Record<string, { price: number | null; oldPrice: number | null; onSale: boolean; published: boolean }> = {}
    for (const r of rows) {
      overrides[r.moto_id] = { price: r.price, oldPrice: r.on_sale ? r.old_price : null, onSale: r.on_sale, published: r.published }
    }
    // Cachear poco tiempo: un cambio del admin debe verse casi al instante, pero
    // sin pedir la base de datos en cada clic de un mismo visitante.
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, overrides })
  } catch (e) {
    console.error('motos-overrides', e)
    // Si la base de datos falla, la web sigue mostrando el catálogo estático (ver src/lib/motos-live.tsx)
    return res.status(500).json({ ok: false })
  }
}
