/**
 * REPUESTOS Y ACCESORIOS
 * ---------------------------------------------------------------
 * Las especificaciones de cada grupo salen de las fichas técnicas del
 * catálogo (`npm run audit` → scripts/parts-from-catalog.mjs): son los
 * componentes que realmente montan estas motos, no una lista genérica.
 *
 * ✏️ EDITABLE: añade, quita o renombra grupos libremente. No llevan precio
 * a propósito — la cotización se hace por WhatsApp, como en el catálogo.
 */

export type Repuesto = {
  id: string
  /** Icono del set propio: ver src/components/art/Icons.tsx */
  icon: 'battery' | 'plug' | 'tire' | 'brake' | 'shock' | 'light' | 'dash' | 'tools'
  name: string
  /** Qué cubre, en una línea */
  text: string
  /** Variantes reales que se manejan; se listan como etiquetas */
  specs: string[]
}

export const REPUESTOS: Repuesto[] = [
  {
    id: 'baterias',
    icon: 'battery',
    name: 'Baterías',
    text: 'La pieza que más se reemplaza. De grafeno o litio, extraíbles o fijas.',
    specs: ['48V', '60V', '72V', 'Grafeno', 'Litio', '20AH', '27AH'],
  },
  {
    id: 'cargadores',
    icon: 'plug',
    name: 'Cargadores',
    text: 'De repuesto o para dejar uno en el trabajo y otro en casa.',
    specs: ['48V / 3A', '60V / 3A', 'Para plomo', 'Para litio'],
  },
  {
    id: 'llantas',
    icon: 'tire',
    name: 'Llantas y rines',
    text: 'Sellomatic y convencionales, en las medidas del catálogo.',
    specs: ['2.75-10', '3.00-10', '90/90-12', '100-80-12', '16-3.0', 'Rin metálico'],
  },
  {
    id: 'frenos',
    icon: 'brake',
    name: 'Frenos',
    text: 'Discos, pastillas, bandas y guayas para mantener la frenada a punto.',
    specs: ['Disco', 'Disco hidráulico', 'Doble pistón', 'Banda', 'Guaya'],
  },
  {
    id: 'suspension',
    icon: 'shock',
    name: 'Suspensión',
    text: 'Amortiguadores y barras para recuperar la comodidad de marcha.',
    specs: ['Telescópica', 'Mono shock', 'Dual shock', 'Hidráulica'],
  },
  {
    id: 'luces',
    icon: 'light',
    name: 'Luces y direccionales',
    text: 'Farolas LED, stop, direccionales y luces de parqueo.',
    specs: ['LED', 'Doble faro', 'Doble lente', 'Stop', 'Direccionales'],
  },
  {
    id: 'tablero',
    icon: 'dash',
    name: 'Tableros y mandos',
    text: 'Tableros digitales, acelerador, maniguetas y cableado.',
    specs: ['Digital', 'Digital a color', 'Acelerador', 'Maniguetas'],
  },
  {
    id: 'accesorios',
    icon: 'tools',
    name: 'Accesorios',
    text: 'Espejos, baúl, parrilla, espaldar y alarma con bloqueo.',
    specs: ['Espejos', 'Baúl', 'Parrilla', 'Espaldar', 'Alarma'],
  },
]
