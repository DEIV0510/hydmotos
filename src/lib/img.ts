/**
 * React 18 todavía no conoce `fetchPriority`: lo vuelca en el DOM en
 * minúsculas —que es lo correcto— pero deja un aviso en cada render. Pasarlo
 * ya en minúsculas evita el ruido en consola sin cambiar el HTML resultante.
 */
export const prioridad = (v: 'high' | 'low' | 'auto') =>
  ({ fetchpriority: v }) as unknown as { fetchPriority?: 'high' | 'low' | 'auto' }
