import type { MotoVariant } from '@/components/art/MotoArt'

/**
 * CATÁLOGO H&D MOTORENS
 * ---------------------------------------------------------------
 * Datos entregados por el cliente. NO modificar precios ni fichas
 * sin autorización. Para agregar una moto, copiar un objeto y
 * ajustar campos: la web (grid, filtros, buscador, orden, destacados
 * y contadores) se alimenta automáticamente de este array.
 *
 * `image`     -> ruta real de la foto cuando exista (public/motos/...)
 * `imageCode` -> código del recurso original entregado por el cliente
 * `art`       -> silueta vectorial usada mientras no haya foto
 */

export type Battery = 'Grafeno' | 'Litio'
export type CategoryId = 'urbana' | 'familiar' | 'matricula' | 'tricimotor'

export type Moto = {
  id: string
  name: string
  category: CategoryId
  /** Precio de venta en COP */
  price: number
  /** Precio anterior en COP; su presencia activa el badge de oferta */
  oldPrice?: number

  image?: string
  imageCode?: string
  art: MotoVariant

  // --- Métricas numéricas (filtros y ordenamiento) ---
  /** Autonomía en km */
  range: number
  /** Velocidad máxima en km/h */
  speed: number
  /** Potencia nominal en W */
  power: number

  // --- Ficha técnica (texto literal del cliente) ---
  battery: Battery
  capacity: string
  brakes: string
  mirrors: string
  tire: string
  bikeLane: string
  turnSignals: string

  soat: boolean
  matricula: boolean
  tecnomecanica: boolean
  alarm: boolean
  pedals: boolean
  led: boolean
  stop: boolean
  parkingLights: boolean
  /** Solo algunos modelos lo declaran */
  reverse?: boolean
}

/** Valores compartidos por todo el catálogo entregado */
const base = {
  mirrors: 'De lujo',
  tire: 'Sello Matic',
  bikeLane: 'Sí, máximo 25 km/h',
  turnSignals: 'Delanteras y traseras',
  alarm: true,
  stop: true,
  soat: false,
  matricula: false,
  tecnomecanica: false,
} as const

export const MOTOS: Moto[] = [
  {
    ...base,
    id: 'urban',
    name: 'URBAN',
    category: 'urbana',
    price: 3_300_000,
    imageCode: '3lopc2ghol',
    art: 'scooter',
    range: 35,
    speed: 40,
    power: 350,
    battery: 'Grafeno',
    capacity: '130 kg',
    brakes: 'Delantero y trasero, banda',
    pedals: true,
    led: true,
    parkingLights: false,
  },
  {
    ...base,
    id: 'zeus',
    name: 'ZEUS',
    category: 'urbana',
    price: 4_000_000,
    imageCode: 'f13ayp0xdy',
    art: 'street',
    range: 55,
    speed: 40,
    power: 350,
    battery: 'Grafeno',
    capacity: '150 kg',
    brakes: 'Delantero de disco y trasero',
    pedals: true,
    led: true,
    parkingLights: false,
  },
  {
    ...base,
    id: 'urbex',
    name: 'URBEX',
    category: 'urbana',
    price: 4_070_000,
    imageCode: '6qte1sl7hw',
    art: 'street',
    range: 55,
    speed: 40,
    power: 350,
    battery: 'Grafeno',
    capacity: '150 kg',
    brakes: 'Delantero de disco y trasero de banda',
    pedals: true,
    led: true,
    parkingLights: false,
  },
  {
    ...base,
    id: 'reina',
    name: 'REINA',
    category: 'urbana',
    price: 3_700_000,
    imageCode: 'zt97s8s4mb',
    art: 'scooter',
    range: 40,
    speed: 40,
    power: 350,
    battery: 'Grafeno',
    capacity: '150 kg',
    brakes: 'Delantero de disco y trasero de banda',
    pedals: true,
    led: true,
    parkingLights: false,
  },
  {
    ...base,
    id: 'family-q',
    name: 'FAMILY Q',
    category: 'familiar',
    price: 4_720_000,
    imageCode: 'k3nij7rgxn',
    art: 'scooter',
    range: 50,
    speed: 35,
    power: 550,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, banda',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'moped',
    name: 'MOPED',
    category: 'urbana',
    price: 3_200_000,
    imageCode: 'fdf4mke2v6',
    art: 'street',
    range: 65,
    speed: 50,
    power: 550,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, banda',
    pedals: true,
    led: true,
    parkingLights: false,
  },
  {
    ...base,
    id: 'family-plus-5420',
    name: 'FAMILY PLUS',
    category: 'familiar',
    price: 5_420_000,
    imageCode: '4kv80d8rir',
    art: 'scooter',
    range: 55,
    speed: 35,
    power: 350,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, banda',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'motorens',
    name: 'MOTORENS',
    category: 'urbana',
    price: 2_400_000,
    oldPrice: 2_700_000,
    imageCode: 'tkthx14ix3',
    art: 'street',
    range: 60,
    speed: 60,
    power: 400,
    battery: 'Grafeno',
    capacity: '2 personas / 180 kg',
    brakes: 'Delantero y trasero, banda',
    pedals: true,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'biwi-electrica',
    name: 'BIWI ELÉCTRICA',
    category: 'matricula',
    price: 8_000_000,
    oldPrice: 8_500_000,
    imageCode: 's98rc45suc',
    art: 'sport',
    range: 90,
    speed: 88,
    power: 1800,
    battery: 'Grafeno',
    capacity: '3 personas / 290 kg',
    brakes: 'Delantero y trasero, disco',
    pedals: false,
    led: true,
    parkingLights: true,
    reverse: true,
    soat: true,
    matricula: true,
    tecnomecanica: true,
    bikeLane: 'No',
  },
  {
    ...base,
    id: 'classic-run',
    name: 'CLASSIC RUN',
    category: 'matricula',
    price: 4_500_000,
    oldPrice: 5_000_000,
    imageCode: 'iqliqar6sa',
    art: 'street',
    range: 70,
    speed: 75,
    power: 1000,
    battery: 'Grafeno',
    capacity: '2 personas / 240 kg',
    brakes: 'Disco delantero y banda trasera',
    pedals: false,
    led: true,
    parkingLights: true,
    soat: true,
    matricula: true,
    tecnomecanica: true,
  },
  {
    ...base,
    id: 'ryder-pro',
    name: 'RYDER PRO',
    category: 'urbana',
    price: 4_100_000,
    imageCode: 'crh2rfoxsr',
    art: 'street',
    range: 65,
    speed: 50,
    power: 350,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Disco delantero y banda trasera',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'tigre',
    name: 'TIGRE',
    category: 'urbana',
    price: 4_000_000,
    imageCode: 'uqtj0o8dbr',
    art: 'trail',
    range: 65,
    speed: 50,
    power: 350,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Disco delantero y banda trasera',
    pedals: true,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'polar',
    name: 'POLAR',
    category: 'urbana',
    price: 4_000_000,
    imageCode: 'srwe6sw3xq',
    art: 'street',
    range: 65,
    speed: 50,
    power: 350,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Disco delantero y banda trasera',
    pedals: true,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'magma-neva',
    name: 'MAGMA NEVA',
    category: 'urbana',
    price: 4_480_000,
    imageCode: '9jchlodwho',
    art: 'trail',
    range: 65,
    speed: 50,
    power: 350,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Disco delantero y banda trasera',
    pedals: true,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'family',
    name: 'FAMILY',
    category: 'familiar',
    price: 4_400_000,
    imageCode: 'ra57o67j3h',
    art: 'scooter',
    range: 65,
    speed: 50,
    power: 550,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, banda',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'family-plus-5200',
    name: 'FAMILY PLUS',
    category: 'familiar',
    price: 5_200_000,
    imageCode: 'jl7uzc3zfj',
    art: 'scooter',
    range: 65,
    speed: 50,
    power: 550,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, banda',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'cielo',
    name: 'CIELO',
    category: 'urbana',
    price: 3_700_000,
    // Sin código de imagen entregado: se muestra con arte vectorial.
    art: 'scooter',
    range: 45,
    speed: 40,
    power: 550,
    battery: 'Litio',
    capacity: '2 personas',
    brakes: 'Delantero y trasero, disco',
    mirrors: 'No',
    pedals: true,
    led: false,
    parkingLights: false,
  },
  {
    ...base,
    id: 'tricimotor-electrico',
    name: 'TRICIMOTOR ELÉCTRICO',
    category: 'tricimotor',
    price: 5_990_000,
    oldPrice: 6_500_000,
    imageCode: '9ea2nwz62x',
    art: 'trike',
    range: 65,
    speed: 40,
    power: 400,
    battery: 'Grafeno',
    capacity: '2 personas / 240 kg',
    brakes: 'Delantero y trasero, disco',
    pedals: false,
    led: true,
    parkingLights: true,
  },
  {
    ...base,
    id: 'beetle',
    name: 'BEETLE',
    category: 'familiar',
    price: 4_600_000,
    imageCode: 'kigsq0yqni',
    art: 'scooter',
    range: 65,
    speed: 50,
    power: 550,
    battery: 'Grafeno',
    capacity: '2 personas',
    brakes: 'Disco delantero y banda trasera',
    pedals: true,
    led: true,
    parkingLights: true,
  },
]

/* ---------------------------------------------------------------- */
/*  Derivados: nada de esto se escribe a mano                        */
/* ---------------------------------------------------------------- */

export const CATEGORIES: { id: CategoryId | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'urbana', label: 'Urbanas' },
  { id: 'familiar', label: 'Familiares' },
  { id: 'matricula', label: 'Con matrícula' },
  { id: 'tricimotor', label: 'Tricimotor' },
]

/** Autonomía / velocidad / potencia declaradas para el rango del catálogo */
export const STATS = {
  total: MOTOS.length,
  maxRange: Math.max(...MOTOS.map((m) => m.range)),
  maxSpeed: Math.max(...MOTOS.map((m) => m.speed)),
  maxPower: Math.max(...MOTOS.map((m) => m.power)),
  minPrice: Math.min(...MOTOS.map((m) => m.price)),
  offers: MOTOS.filter((m) => m.oldPrice).length,
}

/** Especificación con etiqueta legible, en el orden de la ficha del cliente */
export function specsOf(m: Moto): { label: string; value: string }[] {
  const yn = (v: boolean) => (v ? 'Sí' : 'No')
  const rows: { label: string; value: string }[] = [
    { label: 'Batería', value: m.battery },
    { label: 'Autonomía', value: `${m.range} km` },
    { label: 'Velocidad', value: `${m.speed} km/h` },
    { label: 'Motor', value: `${m.power.toLocaleString('es-CO')}W nominal` },
    { label: 'Capacidad', value: m.capacity },
    { label: 'Freno', value: m.brakes },
    { label: 'Llanta', value: m.tire },
    { label: 'Espejos', value: m.mirrors },
    { label: 'Sistema de alarma', value: yn(m.alarm) },
    { label: 'Pedales asistidos', value: yn(m.pedals) },
    { label: 'Luces LED', value: yn(m.led) },
    { label: 'Direccionales', value: m.turnSignals },
    { label: 'Stop', value: yn(m.stop) },
    { label: 'Luces de parqueo', value: yn(m.parkingLights) },
    { label: 'Apta para ciclovía', value: m.bikeLane },
    { label: 'SOAT', value: yn(m.soat) },
    { label: 'Matrícula', value: yn(m.matricula) },
    { label: 'Tecnomecánica', value: yn(m.tecnomecanica) },
  ]
  if (m.reverse !== undefined) rows.push({ label: 'Reversa', value: yn(m.reverse) })
  return rows
}

export function formatCOP(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}
