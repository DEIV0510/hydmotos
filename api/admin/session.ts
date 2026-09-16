/** GET /api/admin/session — ¿hay una sesión de administrador válida ahora mismo? */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sesionDeLaPeticion } from '../_lib/auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false })
  return res.status(200).json({ ok: true, email: sesion.email })
}
