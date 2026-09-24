import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { CARRO, CARRO_MINI, type Media } from '@/data/media'

/**
 * Patinetas y carros, editables desde /admin/patinetas y /admin/carros. Mismo
 * patrón que motos-live.tsx: mientras no responde la API (o si falla) se ven
 * los dos carros de siempre, así que la sección nunca queda vacía.
 */

export type Imagen = { src: string; srcSet?: string; alt?: string }

export type Vehiculo = {
  id: string
  tipo: 'patineta' | 'carro'
  name: string
  detail: string | null
  price: number | null
  /** Solo con oferta activa */
  oldPrice: number | null
  images: Imagen[]
  description: string | null
  range: number | null
  speed: number | null
}

const fotos = (lista: Media[], ids?: string[]): Imagen[] =>
  (ids ? ids.map((id) => lista.find((m) => m.id === id)) : lista)
    .filter((m): m is Media => Boolean(m))
    .map((m) => ({ src: m.src, srcSet: m.srcSet, alt: m.alt }))

/** Lo mismo que siembra scripts/db-migrate.mjs */
const CARROS_INICIALES: Vehiculo[] = [
  {
    id: 'carro-plateado',
    tipo: 'carro',
    name: 'Carro eléctrico plateado',
    detail: '5 puertas',
    price: null,
    oldPrice: null,
    images: fotos(CARRO, ['tres-cuartos', 'lateral', 'frente', 'faro']),
    description: null,
    range: null,
    speed: null,
  },
  {
    id: 'carro-azul-claro',
    tipo: 'carro',
    name: 'Carro eléctrico azul claro',
    detail: '2 puertas · techo blanco',
    price: null,
    oldPrice: null,
    images: fotos(CARRO_MINI),
    description: null,
    range: null,
    speed: null,
  },
]

type Fila = {
  id: string
  tipo: string
  name: string
  detail: string | null
  price: number | null
  old_price: number | null
  on_sale: boolean
  images: Imagen[]
  description: string | null
  range: number | null
  speed: number | null
}

const desdeFila = (f: Fila): Vehiculo => ({
  id: f.id,
  tipo: f.tipo === 'patineta' ? 'patineta' : 'carro',
  name: f.name,
  detail: f.detail,
  price: f.price,
  oldPrice: f.on_sale && f.old_price ? f.old_price : null,
  images: Array.isArray(f.images) ? f.images : [],
  description: f.description,
  range: f.range,
  speed: f.speed,
})

type Estado = { carros: Vehiculo[]; patinetas: Vehiculo[] }

const VehiculosVivoContext = createContext<Estado>({ carros: CARROS_INICIALES, patinetas: [] })

export function VehiculosVivoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ carros: CARROS_INICIALES, patinetas: [] })

  useEffect(() => {
    let cancelado = false
    fetch('/api/public/vehiculos')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok: boolean; vehiculos?: Fila[] } | null) => {
        if (cancelado || !d?.ok || !d.vehiculos) return
        const todos = d.vehiculos.map(desdeFila)
        setEstado({
          carros: todos.filter((v) => v.tipo === 'carro'),
          patinetas: todos.filter((v) => v.tipo === 'patineta'),
        })
      })
      .catch(() => {
        /* sin API: se quedan los dos carros de siempre */
      })
    return () => {
      cancelado = true
    }
  }, [])

  return <VehiculosVivoContext.Provider value={estado}>{children}</VehiculosVivoContext.Provider>
}

export function useVehiculosVivo() {
  return useContext(VehiculosVivoContext)
}

/** Mensaje de WhatsApp de un vehículo: nombre tal cual lo escribió el admin, más su detalle */
export function waForVehiculo(v: Vehiculo) {
  const que = v.tipo === 'carro' ? 'este carro' : 'esta patineta'
  return `Hola, quiero comprar ${que} que vi en la web de H&D MOTORENS: ${v.name}${v.detail ? ` (${v.detail})` : ''}. ¿Me confirman precio y disponibilidad?`
}
