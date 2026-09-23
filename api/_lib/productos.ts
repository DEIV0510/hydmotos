/**
 * Validaciones compartidas entre los endpoints de productos creados desde el
 * panel (custom-motos, custom-repuestos): mismo criterio que ya usaban
 * api/admin/motos.ts y api/admin/upload.ts, para no repetirlo distinto en
 * cada archivo.
 */

export const PRECIO_MAXIMO = 1_000_000_000 // tope contra un typo, no un límite real de negocio

export function precioValido(v: unknown): v is number | null {
  return v === null || v === undefined || (typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= PRECIO_MAXIMO)
}

/** '' → null; recorta espacios; deja pasar undefined tal cual (== "no se tocó este campo") */
export function textoOpcional(v: unknown): string | null | undefined {
  if (v === undefined) return undefined
  if (typeof v !== 'string') return null
  const limpio = v.trim()
  return limpio.length > 0 ? limpio : null
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
