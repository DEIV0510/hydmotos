/**
 * /api/public/:recurso — una sola función para todo lo que lee la web pública.
 * Mismo motivo y mismo mecanismo que api/admin.ts: el límite de 12 funciones
 * por deploy del plan Hobby. Las URLs no cambian (vercel.json las reescribe a
 * /api/public?recurso=…); los manejadores están en api/_handlers/public/.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import customMotos from './_handlers/public/custom-motos.js'
import customRepuestos from './_handlers/public/custom-repuestos.js'
import motosOverrides from './_handlers/public/motos-overrides.js'
import repuestosOverrides from './_handlers/public/repuestos-overrides.js'
import settings from './_handlers/public/settings.js'
import vehiculos from './_handlers/public/vehiculos.js'

type Manejador = (req: VercelRequest, res: VercelResponse) => unknown

// Map y no un objeto: con un objeto, /api/public/toString encontraría una función heredada
const RUTAS = new Map<string, Manejador>([
  ['motos-overrides', motosOverrides],
  ['repuestos-overrides', repuestosOverrides],
  ['settings', settings],
  ['custom-motos', customMotos],
  ['custom-repuestos', customRepuestos],
  ['vehiculos', vehiculos],
])

export default function handler(req: VercelRequest, res: VercelResponse) {
  const manejar = RUTAS.get(String(req.query.recurso))
  if (!manejar) return res.status(404).json({ ok: false, error: 'No encontrado' })
  // Todo lo público es de solo lectura: antes un POST respondía 200 con los datos
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }
  return manejar(req, res)
}
