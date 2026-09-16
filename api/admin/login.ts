/**
 * POST /api/admin/login  { email, password }
 * Verifica contra ADMIN_EMAIL / ADMIN_PASSWORD_HASH (variables de entorno,
 * nunca en el código) y, si coincide, pone la cookie de sesión.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cookieDeSesion, crearSesion, verificarPassword } from '../_lib/auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' })

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }
  const adminEmail = process.env.ADMIN_EMAIL
  const adminHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminHash) {
    console.error('Faltan ADMIN_EMAIL/ADMIN_PASSWORD_HASH')
    return res.status(500).json({ ok: false, error: 'El panel no está configurado todavía.' })
  }
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Escribe correo y contraseña.' })
  }

  // Mismo mensaje siempre: no revelar si falló el correo o la contraseña.
  const coincide =
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
    verificarPassword(password, adminHash)

  if (!coincide) {
    return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' })
  }

  res.setHeader('Set-Cookie', cookieDeSesion(crearSesion(adminEmail)))
  return res.status(200).json({ ok: true, email: adminEmail })
}
