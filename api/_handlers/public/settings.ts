/**
 * GET /api/public/settings — sin autenticación: lo consume la web pública para
 * mostrar Hero, contacto, WhatsApp, SEO y menú tal como los dejó el
 * administrador. Si una sección no existe todavía en la base de datos (o la
 * base de datos falla), `src/lib/settings-live.tsx` sigue con el contenido
 * estático de siempre — nunca una sección vacía.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql<{ key: string; value: unknown }>`select key, value from site_settings`
    const settings: Record<string, unknown> = {}
    for (const r of rows) settings[r.key] = r.value

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ ok: true, settings })
  } catch (e) {
    console.error('public/settings', e)
    return res.status(500).json({ ok: false })
  }
}
