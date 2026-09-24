/**
 * /api/admin/:recurso — una sola función para todo el panel.
 *
 * El plan Hobby de Vercel admite 12 funciones por deploy, y con un archivo
 * por endpoint ya iban 14: los deploys fallaban al publicar. Las URLs no
 * cambian (/api/admin/login, /api/admin/motos…): vercel.json las reescribe a
 * /api/admin?recurso=… y cada manejador vive en api/_handlers/admin/. Cada uno
 * sigue verificando la sesión por su cuenta.
 *
 * No es api/admin/[recurso].ts a propósito: una ruta dinámica pierde contra
 * el rewrite del SPA (/(.*) → /index.html) y toda la API devolvía la página.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import customMotos from './_handlers/admin/custom-motos.js'
import customRepuestos from './_handlers/admin/custom-repuestos.js'
import login from './_handlers/admin/login.js'
import logout from './_handlers/admin/logout.js'
import motos from './_handlers/admin/motos.js'
import repuestos from './_handlers/admin/repuestos.js'
import session from './_handlers/admin/session.js'
import settings from './_handlers/admin/settings.js'
import upload from './_handlers/admin/upload.js'
import vehiculos from './_handlers/admin/vehiculos.js'

type Manejador = (req: VercelRequest, res: VercelResponse) => unknown

// Map y no un objeto: con un objeto, /api/admin/toString encontraría una función heredada
const RUTAS = new Map<string, Manejador>([
  ['login', login],
  ['logout', logout],
  ['session', session],
  ['motos', motos],
  ['repuestos', repuestos],
  ['upload', upload],
  ['settings', settings],
  ['custom-motos', customMotos],
  ['custom-repuestos', customRepuestos],
  ['vehiculos', vehiculos],
])

export default function handler(req: VercelRequest, res: VercelResponse) {
  const manejar = RUTAS.get(String(req.query.recurso))
  if (!manejar) return res.status(404).json({ ok: false, error: 'No encontrado' })
  return manejar(req, res)
}
