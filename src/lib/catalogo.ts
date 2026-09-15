import type { CategoryId } from '@/data/motos'

/**
 * Pedirle algo al catálogo desde otra sección (los accesos por tipo, el bloque
 * de MAGMA): se aplica el filtro y se baja hasta él. Va por un evento de
 * ventana para no subir el estado del catálogo a toda la página.
 */
export type PeticionCatalogo = { cat?: CategoryId | 'todas'; q?: string }

export const EVENTO_CATALOGO = 'hd:catalogo'

export function abrirCatalogo(p: PeticionCatalogo) {
  window.dispatchEvent(new CustomEvent<PeticionCatalogo>(EVENTO_CATALOGO, { detail: p }))
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document
    .getElementById('motos')
    ?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' })
}
