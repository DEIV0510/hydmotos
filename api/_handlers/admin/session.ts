/** GET /api/admin/session — ¿hay una sesión de administrador válida ahora mismo? */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sesionDeLaPeticion } from '../../_lib/auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const sesion = sesionDeLaPeticion(req)
  // «No hay sesión» es una respuesta válida a esta pregunta, no un error: con
  // un 401 el navegador anotaba un error en la consola cada vez que se abría
  // el login. Los demás endpoints del panel sí responden 401 sin sesión.
  if (!sesion) return res.status(200).json({ ok: false })
  return res.status(200).json({ ok: true, email: sesion.email })
}
