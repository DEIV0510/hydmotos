/**
 * POST /api/admin/upload — sube una imagen (moto o repuesto) a Vercel Blob y
 * devuelve su URL pública. Protegido: sin sesión, 401.
 *
 * El navegador manda la imagen ya como data URL (base64) en el cuerpo JSON,
 * no como archivo binario: así el endpoint es una función Node normal, sin
 * necesitar el flujo de "client upload" de @vercel/blob (pensado para Edge/
 * Request de Fetch, no para el objeto de petición de Node que da Vercel aquí).
 * A cambio, el límite de tamaño es más bajo (ver MAX_BYTES) — de sobra para
 * fotos de producto: las que ya usa el catálogo pesan menos de 150 KB.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { put } from '@vercel/blob'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../../_lib/auth.js'

const MAX_BYTES = 3 * 1024 * 1024 // 3 MB decodidos; deja margen bajo el límite de 4.5 MB del cuerpo de la función
const TIPOS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const CARPETAS = new Set(['motos', 'repuestos', 'contenido'])

function idSeguro(id: unknown): string | null {
  if (typeof id !== 'string') return null
  const limpio = id.toLowerCase().replace(/[^a-z0-9-]/g, '')
  return limpio.length > 0 && limpio.length <= 80 ? limpio : null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const { dataUrl, folder, id } = (req.body ?? {}) as { dataUrl?: string; folder?: string; id?: string }
  const carpeta = typeof folder === 'string' && CARPETAS.has(folder) ? folder : null
  const idLimpio = idSeguro(id)

  if (!carpeta || !idLimpio) {
    return res.status(400).json({ ok: false, error: 'Faltan datos para subir la imagen.' })
  }

  const match = typeof dataUrl === 'string' ? dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/) : null
  if (!match) {
    return res.status(400).json({ ok: false, error: 'La imagen debe ser JPG, PNG o WEBP.' })
  }

  const [, mime, base64] = match
  const buffer = Buffer.from(base64, 'base64')
  if (buffer.byteLength === 0) {
    return res.status(400).json({ ok: false, error: 'La imagen está vacía.' })
  }
  if (buffer.byteLength > MAX_BYTES) {
    return res.status(400).json({ ok: false, error: 'La imagen pesa demasiado. Máximo 3 MB.' })
  }

  try {
    const nombre = `${carpeta}/${idLimpio}-${Date.now()}.${TIPOS[mime]}`
    const blob = await put(nombre, buffer, { access: 'public', contentType: mime })

    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'upload_image', ${JSON.stringify({ carpeta, id: idLimpio, url: blob.url })})
    `
    return res.status(200).json({ ok: true, url: blob.url })
  } catch (e) {
    console.error('admin/upload', e)
    return res.status(500).json({ ok: false, error: 'No se pudo subir la imagen. Intenta nuevamente.' })
  }
}
