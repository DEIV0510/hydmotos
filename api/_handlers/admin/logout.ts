/** POST /api/admin/logout — borra la cookie de sesión */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cookieDeSesion } from '../../_lib/auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' })
  res.setHeader('Set-Cookie', cookieDeSesion(null))
  return res.status(200).json({ ok: true })
}
