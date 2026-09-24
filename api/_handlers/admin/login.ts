/**
 * POST /api/admin/login  { email, password }
 * Verifica contra ADMIN_EMAIL / ADMIN_PASSWORD_HASH (variables de entorno,
 * nunca en el código) y, si coincide, pone la cookie de sesión.
 *
 * Límite de intentos: después de MAX_FALLIDOS intentos fallidos desde la misma
 * IP en VENTANA_MIN minutos, responde 429 hasta que pase la ventana. Sin él,
 * cualquiera podía probar contraseñas sin freno. Es por IP y no por cuenta a
 * propósito: por cuenta, un tercero podría dejar al dueño sin poder entrar.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { cookieDeSesion, crearSesion, verificarPassword } from '../../_lib/auth.js'

const MAX_FALLIDOS = 8
const VENTANA_MIN = 15
/** Ninguna contraseña real es más larga; evita hacer trabajar a scrypt con textos enormes */
const MAX_LARGO = 200

/** Vercel reescribe x-forwarded-for con la IP real del cliente: desde fuera no se falsifica */
function ipDe(req: VercelRequest): string {
  const xff = req.headers['x-forwarded-for']
  const primera = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim()
  return primera || String(req.headers['x-real-ip'] ?? 'desconocida')
}

async function fallidosRecientes(ip: string): Promise<number> {
  try {
    const { rows } = await sql<{ n: number }>`
      select count(*)::int as n from admin_login_intentos
      where ip = ${ip} and creado > now() - ${VENTANA_MIN}::int * interval '1 minute'
    `
    return rows[0]?.n ?? 0
  } catch (e) {
    // Sin la tabla o sin base de datos el login sigue funcionando: el límite es una capa extra
    console.error('No se pudieron leer los intentos de login', e)
    return 0
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  if (email.length > MAX_LARGO || password.length > MAX_LARGO) {
    return res.status(400).json({ ok: false, error: 'Correo o contraseña demasiado largos.' })
  }

  const ip = ipDe(req)
  if ((await fallidosRecientes(ip)) >= MAX_FALLIDOS) {
    res.setHeader('Retry-After', String(VENTANA_MIN * 60))
    return res.status(429).json({
      ok: false,
      error: `Demasiados intentos fallidos. Espera ${VENTANA_MIN} minutos y vuelve a intentarlo.`,
    })
  }

  // Mismo mensaje siempre: no revelar si falló el correo o la contraseña. Y la
  // contraseña se verifica aunque el correo no coincida: si no, la respuesta
  // llegaba antes (sin scrypt) y el tiempo delataba cuál de los dos falló.
  const passwordOk = verificarPassword(password, adminHash)
  const emailOk = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()

  if (!(emailOk && passwordOk)) {
    await sql`insert into admin_login_intentos (ip) values (${ip})`.catch((e) =>
      console.error('No se pudo anotar el intento de login', e),
    )
    return res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos.' })
  }

  // Entró: se borran sus intentos y, de paso, los de hace más de un día
  await sql`delete from admin_login_intentos where ip = ${ip} or creado < now() - interval '1 day'`.catch((e) =>
    console.error('No se pudieron limpiar los intentos de login', e),
  )
  res.setHeader('Set-Cookie', cookieDeSesion(crearSesion(adminEmail)))
  return res.status(200).json({ ok: true, email: adminEmail })
}
