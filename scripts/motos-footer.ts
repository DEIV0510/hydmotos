/* ---------------------------------------------------------------- */
/*  Derivados: nada de esto se escribe a mano                        */
/* ---------------------------------------------------------------- */

export const CATEGORIES: { id: CategoryId | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'urbana', label: 'Urbanas' },
  { id: 'familiar', label: 'Familiares' },
  { id: 'matricula', label: 'Alta potencia' },
  { id: 'tricimotor', label: 'Tricimotor' },
]

const conPrecio = MOTOS.filter((m) => m.price)

export const STATS = {
  total: MOTOS.length,
  maxRange: Math.max(...MOTOS.map((m) => m.range ?? 0)),
  maxSpeed: Math.max(...MOTOS.map((m) => m.speed ?? 0)),
  maxPower: Math.max(...MOTOS.map((m) => m.power ?? 0)),
  minPrice: conPrecio.length ? Math.min(...conPrecio.map((m) => m.price!)) : 0,
  offers: MOTOS.filter((m) => m.oldPrice).length,
  withPrice: conPrecio.length,
}

/**
 * Nombres distintos para el mismo dato. Sirve para no repetir una fila
 * cuando la ficha del proveedor la escribe de otra manera.
 */
const ALIAS: Record<string, string> = {
  motor: 'motor',
  potencia: 'motor',
  velocidad: 'velocidad',
  'velocidad máxima': 'velocidad',
  autonomía: 'autonomía',
  batería: 'batería',
  llanta: 'llanta',
  'llanta delantera': 'llanta',
  'llanta trasera': 'llanta-tras',
  'tipo de llanta': 'llanta',
  espejos: 'espejos',
  'capacidad de carga': 'capacidad',
  capacidad: 'capacidad',
  silla: 'capacidad',
  colores: 'colores',
  color: 'colores',
  freno: 'freno',
  frenos: 'freno',
  'freno delantero': 'freno-del',
  'freno trasero': 'freno-tras',
  'tiempo de carga': 'carga',
  alarma: 'sistema de alarma',
  'pedaleo asistido': 'pedales asistidos',
  direccionales: 'direccionales',
}
const claveDe = (label: string) => ALIAS[label.toLowerCase()] ?? label.toLowerCase()

/** Ficha técnica lista para mostrar; omite lo que no se declaró */
export function specsOf(m: Moto): { label: string; value: string }[] {
  const yn = (v: boolean) => (v ? 'Sí' : 'No')

  // Lo que el proveedor ya detalla mejor no se repite con la versión resumida:
  // si trae "Freno delantero" y "Freno trasero", sobra el "Freno" combinado.
  const delProveedor = new Set((m.sheet ?? []).map((s) => claveDe(s.label)))
  const yaDetallado = (clave: string, ...finos: string[]) =>
    finos.some((f) => delProveedor.has(f)) || delProveedor.has(clave)

  const rows: { label: string; value: string }[] = [{ label: 'Batería', value: m.battery }]

  if (m.range) rows.push({ label: 'Autonomía', value: `${m.range} km` })
  if (m.speed) rows.push({ label: 'Velocidad', value: `${m.speed} km/h` })
  if (m.power) rows.push({ label: 'Motor', value: `${m.power.toLocaleString('es-CO')}W nominal` })
  if (m.capacity && !yaDetallado('capacidad')) rows.push({ label: 'Capacidad', value: m.capacity })
  if (m.brakes && !yaDetallado('freno', 'freno-del', 'freno-tras')) {
    rows.push({ label: 'Freno', value: m.brakes })
  }
  if (m.charge && !yaDetallado('carga')) rows.push({ label: 'Tiempo de carga', value: m.charge })
  if (m.colors?.length && !yaDetallado('colores')) {
    rows.push({ label: 'Colores', value: m.colors.join(', ') })
  }
  if (!yaDetallado('llanta', 'llanta-tras')) rows.push({ label: 'Llanta', value: m.tire })
  if (!yaDetallado('espejos')) rows.push({ label: 'Espejos', value: m.mirrors })

  // Resto de la ficha del proveedor, sin repetir lo ya puesto
  if (m.sheet?.length) {
    const puestos = new Set(rows.map((r) => claveDe(r.label)))
    for (const s of m.sheet) {
      const clave = claveDe(s.label)
      if (puestos.has(clave)) continue
      puestos.add(clave)
      rows.push(s)
    }
  }

  // Los equipamientos solo se afirman en los modelos con ficha del cliente:
  // en los demás el Excel no los declara y no se inventan.
  if (m.source === 'cliente') {
    const puestos = new Set(rows.map((r) => claveDe(r.label)))
    const añadir = (label: string, value: string) => {
      if (puestos.has(claveDe(label))) return
      puestos.add(claveDe(label))
      rows.push({ label, value })
    }
    añadir('Sistema de alarma', yn(m.alarm))
    añadir('Pedales asistidos', yn(m.pedals))
    añadir('Luces LED', yn(m.led))
    añadir('Direccionales', m.turnSignals)
    añadir('Stop', yn(m.stop))
    añadir('Luces de parqueo', yn(m.parkingLights))
    añadir('Apta para ciclovía', m.bikeLane)
    añadir('SOAT', yn(m.soat))
    añadir('Matrícula', yn(m.matricula))
    añadir('Tecnomecánica', yn(m.tecnomecanica))
    if (m.reverse !== undefined) añadir('Reversa', yn(m.reverse))
  }
  return rows
}

export function formatCOP(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

/** Rutas de la foto procesada, o null si el modelo aún no tiene */
export function photoOf(m: Moto) {
  if (!m.image) return null
  return { src: `/motos/${m.image}.webp`, srcSet: `/motos/${m.image}.webp 450w, /motos/${m.image}@2x.webp 900w` }
}
