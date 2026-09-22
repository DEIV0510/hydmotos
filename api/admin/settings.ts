/**
 * GET   /api/admin/settings        → todas las secciones de contenido (protegido)
 * PATCH /api/admin/settings        → guarda una sección: { key, value } (protegido)
 *
 * Fase 3: Hero, contacto, WhatsApp, SEO y menú, editables desde /admin/contenido
 * sin tocar código. Una fila por sección en `site_settings` (jsonb), no una
 * tabla por campo — así se pueden sumar campos a futuro sin otra migración.
 * Cada sección se valida aquí, en el servidor: el formulario del admin no es
 * la única barrera.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { sesionDeLaPeticion } from '../_lib/auth.js'

const TEXTO_MAX = 400

function esTexto(v: unknown, max = TEXTO_MAX): v is string {
  return typeof v === 'string' && v.length <= max
}
function esTextoNoVacio(v: unknown, max = TEXTO_MAX): v is string {
  return esTexto(v, max) && v.trim().length > 0
}
function esUrlHttpsOVacio(v: unknown): v is string {
  return esTexto(v) && (v === '' || /^https:\/\//.test(v))
}
function esHrefValido(v: unknown): v is string {
  return esTextoNoVacio(v, 300) && (v.startsWith('#') || v.startsWith('http') || v.startsWith('/'))
}

type Validador = (value: unknown) => string | null // null = válido, string = mensaje de error

const VALIDADORES: Record<string, Validador> = {
  hero(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object') return 'Formato inválido.'
    if (!esTextoNoVacio(o.kicker, 80)) return 'La frase de arriba del título es obligatoria.'
    if (!esTextoNoVacio(o.title1, 80)) return 'La primera línea del título es obligatoria.'
    if (!esTextoNoVacio(o.title2, 80)) return 'La segunda línea del título es obligatoria.'
    if (!esTextoNoVacio(o.ctaLabel, 40)) return 'El texto del botón es obligatorio.'
    if (!esHrefValido(o.ctaHref)) return 'El enlace del botón no es válido.'
    if (o.poster != null && !esUrlHttpsOVacio(o.poster)) return 'La imagen de portada no es válida.'
    return null
  },
  contact(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object') return 'Formato inválido.'
    for (const campo of ['phone', 'email', 'address', 'city', 'schedule', 'mapsUrl'] as const) {
      if (!esTexto(o[campo], 200)) return `El campo "${campo}" no es válido.`
    }
    if (!esTexto(o.whatsapp, 20) || (o.whatsapp !== '' && !/^\d{7,15}$/.test(o.whatsapp as string))) {
      return 'El número de WhatsApp debe tener solo dígitos, con el indicativo del país (ej. 573001234567).'
    }
    if (o.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email as string)) {
      return 'El correo no tiene un formato válido.'
    }
    if (o.mapsUrl !== '' && !/^https:\/\//.test(o.mapsUrl as string)) return 'El enlace de Google Maps no es válido.'
    return null
  },
  whatsapp(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object') return 'Formato inválido.'
    if (!esTextoNoVacio(o.generalMessage, TEXTO_MAX)) return 'El mensaje general es obligatorio.'
    if (!esTextoNoVacio(o.productMessageTemplate, TEXTO_MAX)) return 'El mensaje por producto es obligatorio.'
    if (!(o.productMessageTemplate as string).includes('{PRODUCT_NAME}')) {
      return 'El mensaje por producto debe incluir {PRODUCT_NAME}.'
    }
    return null
  },
  seo(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object') return 'Formato inválido.'
    if (!esTextoNoVacio(o.metaTitle, 70)) return 'El título SEO es obligatorio (máx. 70 caracteres).'
    if (!esTextoNoVacio(o.metaDescription, 200)) return 'La descripción SEO es obligatoria (máx. 200 caracteres).'
    if (!esTexto(o.ogTitle, 70) || !esTexto(o.ogDescription, 200)) return 'Los campos de Open Graph no son válidos.'
    if (!esUrlHttpsOVacio(o.ogImage)) return 'La imagen de Open Graph debe ser una URL https.'
    if (!esUrlHttpsOVacio(o.canonical)) return 'La URL canónica debe ser una URL https.'
    return null
  },
  social(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object') return 'Formato inválido.'
    for (const red of ['instagram', 'facebook', 'tiktok', 'youtube'] as const) {
      if (!esUrlHttpsOVacio(o[red])) return `El enlace de ${red} debe ser una URL https o quedar vacío.`
    }
    return null
  },
  nav(v) {
    const o = v as Record<string, unknown>
    if (!o || typeof o !== 'object' || !Array.isArray(o.items)) return 'Formato inválido.'
    const items = o.items as unknown[]
    if (items.length === 0 || items.length > 12) return 'El menú debe tener entre 1 y 12 elementos.'
    for (const it of items) {
      const i = it as Record<string, unknown>
      if (!esTextoNoVacio(i.id, 40) || !/^[a-z0-9-]+$/.test(i.id as string)) return 'Hay un identificador de menú inválido.'
      if (!esTextoNoVacio(i.label, 40)) return 'Cada elemento del menú necesita un nombre.'
      if (!esHrefValido(i.href)) return 'Hay un enlace de menú inválido.'
      if (typeof i.enabled !== 'boolean' || typeof i.newTab !== 'boolean') return 'Faltan datos en un elemento del menú.'
      if (typeof i.order !== 'number' || !Number.isFinite(i.order)) return 'El orden del menú no es válido.'
    }
    return null
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sesion = sesionDeLaPeticion(req)
  if (!sesion) return res.status(401).json({ ok: false, error: 'Sesión no válida. Vuelve a iniciar sesión.' })

  if (req.method === 'GET') {
    const { rows } = await sql<{ key: string; value: unknown }>`select key, value from site_settings`
    const settings: Record<string, unknown> = {}
    for (const r of rows) settings[r.key] = r.value
    return res.status(200).json({ ok: true, settings })
  }

  if (req.method === 'PATCH') {
    const { key, value } = (req.body ?? {}) as { key?: string; value?: unknown }
    const validar = typeof key === 'string' ? VALIDADORES[key] : undefined
    if (!validar) return res.status(400).json({ ok: false, error: 'Sección desconocida.' })

    const error = validar(value)
    if (error) return res.status(400).json({ ok: false, error })

    const antes = (await sql<{ value: unknown }>`select value from site_settings where key = ${key}`).rows[0]

    await sql`
      insert into site_settings (key, value, updated_at)
      values (${key}, ${JSON.stringify(value)}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `

    await sql`
      insert into admin_audit_log (actor, action, detail)
      values (${sesion.email}, 'update_settings', ${JSON.stringify({ key, antes: antes?.value ?? null, despues: value })})
    `

    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return res.status(405).json({ ok: false, error: 'Método no permitido' })
}
