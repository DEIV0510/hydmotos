/**
 * Validaciones compartidas entre los endpoints de productos creados desde el
 * panel (custom-motos, custom-repuestos): mismo criterio que ya usaban
 * api/admin/motos.ts y api/admin/upload.ts, para no repetirlo distinto en
 * cada archivo.
 */

const PRECIO_MAXIMO = 1_000_000_000 // tope contra un typo, no un límite real de negocio

/** Quien llama pasa `v ?? null`: aquí undefined ya no llega */
export function precioValido(v: unknown): v is number | null {
  return v === null || (typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= PRECIO_MAXIMO)
}

/** Autonomía, velocidad, potencia: entero ≥ 0, o null si no vino o no es válido */
export function enteroOpcional(v: unknown): number | null {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 1_000_000 ? v : null
}

/** '' o cualquier cosa que no sea texto → null; recorta espacios */
export function textoOpcional(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const limpio = v.trim()
  return limpio.length > 0 ? limpio : null
}

/** Sin imagen, o una URL https (la que devuelve /api/admin/upload): mismo criterio que motos.ts */
export function imagenValida(v: unknown): v is string | null | undefined {
  return v === undefined || v === null || (typeof v === 'string' && /^https:\/\//.test(v))
}

/** Slug seguro para usar como id: minúsculas, solo [a-z0-9-], máx 80 */
export function idSeguro(nombre: string): string {
  const limpio = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return limpio || 'producto'
}

/** Si el slug ya existe (en el catálogo estático o en la tabla), le suma -2, -3... */
export function idUnico(base: string, existentes: Set<string>): string {
  if (!existentes.has(base)) return base
  for (let i = 2; i < 1000; i++) {
    const candidato = `${base}-${i}`
    if (!existentes.has(candidato)) return candidato
  }
  return `${base}-${Date.now()}`
}

export const CATEGORIAS_MOTO = new Set(['urbana', 'familiar', 'matricula', 'tricimotor'])

export const ICONOS_REPUESTO = new Set([
  'battery',
  'plug',
  'tire',
  'brake',
  'shock',
  'light',
  'dash',
  'tools',
  'bolt',
])
