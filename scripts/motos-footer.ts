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

/** Ficha técnica lista para mostrar; omite lo que no se declaró */
export function specsOf(m: Moto): { label: string; value: string }[] {
  const yn = (v: boolean) => (v ? 'Sí' : 'No')
  const rows: { label: string; value: string }[] = [{ label: 'Batería', value: m.battery }]

  if (m.range) rows.push({ label: 'Autonomía', value: `${m.range} km` })
  if (m.speed) rows.push({ label: 'Velocidad', value: `${m.speed} km/h` })
  if (m.power) rows.push({ label: 'Motor', value: `${m.power.toLocaleString('es-CO')}W nominal` })
  if (m.capacity) rows.push({ label: 'Capacidad', value: m.capacity })
  if (m.brakes) rows.push({ label: 'Freno', value: m.brakes })
  if (m.charge) rows.push({ label: 'Tiempo de carga', value: m.charge })
  if (m.colors?.length) rows.push({ label: 'Colores', value: m.colors.join(', ') })

  rows.push({ label: 'Llanta', value: m.tire }, { label: 'Espejos', value: m.mirrors })

  // Los equipamientos solo se afirman en los modelos con ficha del cliente:
  // en los demás el Excel no los declara y no se inventan.
  if (m.source === 'cliente') {
    rows.push(
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
    )
    if (m.reverse !== undefined) rows.push({ label: 'Reversa', value: yn(m.reverse) })
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
