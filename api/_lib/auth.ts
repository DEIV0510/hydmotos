/**
 * Autenticación del panel de administración.
 *
 * Un único admin (su correo y el hash de su contraseña viven en variables de
 * entorno, nunca en el código ni en el repo). La sesión es una cookie
 * `HttpOnly` firmada con HMAC-SHA256: el navegador no puede leerla ni
 * falsificarla sin conocer `SESSION_SECRET`, que solo existe en el servidor.
 *
 * No se usa ninguna librería de JWT/sesiones: con `node:crypto` alcanza para
 * un solo usuario y mantiene el proyecto con las mismas pocas dependencias
 * que ya tenía.
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { VercelRequest } from '@vercel/node'

const COOKIE = 'hd_admin_session'
const OCHO_HORAS_MS = 8 * 60 * 60 * 1000

function secreto() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('Falta SESSION_SECRET')
  return s
}

function firmar(texto: string) {
  return createHmac('sha256', secreto()).update(texto).digest('base64url')
}

/** Nueva sesión firmada para este correo, válida 8 horas */
export function crearSesion(email: string): string {
  const cuerpo = Buffer.from(JSON.stringify({ email, exp: Date.now() + OCHO_HORAS_MS })).toString(
    'base64url',
  )
  return `${cuerpo}.${firmar(cuerpo)}`
}

/** Verifica la firma y la fecha de vencimiento; null si no es válida */
export function verificarSesion(token: string | null): { email: string } | null {
  if (!token) return null
  const [cuerpo, firma] = token.split('.')
  if (!cuerpo || !firma) return null

  const esperada = Buffer.from(firmar(cuerpo))
  const recibida = Buffer.from(firma)
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null

  try {
    const { email, exp } = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'))
    if (typeof email !== 'string' || typeof exp !== 'number' || Date.now() > exp) return null
    return { email }
  } catch {
    return null
  }
}

/** true si `password` corresponde al hash guardado en ADMIN_PASSWORD_HASH ("scrypt$salt$hash") */
export function verificarPassword(password: string, almacenado: string): boolean {
  const [algoritmo, saltHex, hashHex] = almacenado.split('$')
  if (algoritmo !== 'scrypt' || !saltHex || !hashHex) return false
  const esperado = Buffer.from(hashHex, 'hex')
  const calculado = scryptSync(password, Buffer.from(saltHex, 'hex'), esperado.length)
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}

/** Genera "scrypt$salt$hash" para guardar en ADMIN_PASSWORD_HASH (uso: cambiar la contraseña) */
export function hashDePassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

export function cookieDeSesion(token: string | null): string {
  const partes = [
    `${COOKIE}=${token ?? ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    token ? `Max-Age=${Math.floor(OCHO_HORAS_MS / 1000)}` : 'Max-Age=0',
  ]
  // "Secure" exige HTTPS: en local (vercel dev, http) se omite para poder probar.
  if (process.env.VERCEL_ENV === 'production') partes.push('Secure')
  return partes.join('; ')
}

function leerCookie(cabecera: string | undefined, nombre: string): string | null {
  if (!cabecera) return null
  for (const parte of cabecera.split(';')) {
    const i = parte.indexOf('=')
    if (i === -1) continue
    if (parte.slice(0, i).trim() === nombre) return decodeURIComponent(parte.slice(i + 1).trim())
  }
  return null
}

/** Sesión válida a partir de la cookie de la petición, o null */
export function sesionDeLaPeticion(req: VercelRequest): { email: string } | null {
  return verificarSesion(leerCookie(req.headers.cookie, COOKIE))
}
