/**
 * POST /api/admin/video-token  { destino, tipo, tamano } → { ok, token, pathname } (protegido)
 *
 * El cliente pidió poder cambiar el video del local cuando quiera (nota de
 * voz, 23/09). Un video pesa más de lo que acepta el cuerpo de una función de
 * Vercel (4,5 MB), así que no pasa por aquí: el navegador lo sube directo a
 * Blob con el token que devuelve este endpoint, que solo sirve para esa ruta,
 * ese tipo de video y ese tamaño máximo, y vence en 15 minutos. La URL final
 * se guarda después en site_settings (clave "videos").
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../../_lib/auth.js'

const DESTINOS = new Set(['showroom', 'promo'])
// Solo lo que reproduce cualquier navegador: un .mov de iPhone puede venir en
// HEVC, que Chrome y Android no abren. WhatsApp ya los manda en MP4.
const EXTENSIONES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm' }
const MAX_BYTES = 40 * 1024 * 1024

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const { destino, tipo, tamano } = (req.body ?? {}) as { destino?: unknown; tipo?: unknown; tamano?: unknown }
  if (typeof destino !== 'string' || !DESTINOS.has(destino)) {
    return res.status(400).json({ ok: false, error: 'Destino de video no válido.' })
  }
  const extension = typeof tipo === 'string' ? EXTENSIONES[tipo] : undefined
  if (!extension) {
    return res.status(400).json({ ok: false, error: 'El video debe ser MP4 (así los manda WhatsApp) o WEBM.' })
  }
  if (typeof tamano !== 'number' || tamano <= 0 || tamano > MAX_BYTES) {
    return res.status(400).json({ ok: false, error: 'El video pesa demasiado: máximo 40 MB.' })
  }

  try {
    const pathname = `videos/${destino}.${extension}`
    const token = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: [tipo as string],
      maximumSizeInBytes: MAX_BYTES,
      validUntil: Date.now() + 15 * 60 * 1000,
      addRandomSuffix: true,
    })
    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'video_token', ${JSON.stringify({ destino, tipo, tamano })})
    `
    return res.status(200).json({ ok: true, token, pathname })
  } catch (e) {
    console.error('admin/video-token', e)
    return res.status(500).json({ ok: false, error: 'No se pudo preparar la subida del video. Intenta nuevamente.' })
  }
}
