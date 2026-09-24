import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MOTOS as MOTOS_BASE, photoOf, specsOf, type Moto } from '@/data/motos'

/**
 * Precio, precio anterior, oferta, publicado/oculto e imagen ya no salen solo
 * del archivo estático: el panel de administración (`/admin`) los guarda en
 * la base de datos, y esto los trae a la web pública.
 *
 * Si la petición falla (sin conexión, base de datos caída, primera visita
 * antes de que responda) se sigue mostrando el catálogo estático tal cual
 * está en el repo — nunca una pantalla vacía ni un error visible.
 */

export type MotoConEstado = Moto & {
  published: boolean
  /** Creada desde el panel (custom_motos), no del catálogo generado */
  custom?: boolean
}

type Override = {
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  image: string | null
}

function aplicar(base: Moto, o?: Override): MotoConEstado {
  if (!o) return { ...base, published: true }
  return {
    ...base,
    price: o.price ?? undefined,
    oldPrice: o.onSale && o.oldPrice ? o.oldPrice : undefined,
    published: o.published,
    // Imagen subida desde el panel: URL completa de Vercel Blob. Sin eso,
    // sigue el slug local de siempre (photoOfLive la reconoce por el "http").
    image: o.image ?? base.image,
  }
}

type FilaCustomMoto = {
  id: string
  name: string
  category: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  image: string | null
  range: number | null
  speed: number | null
  power: number | null
  battery: string | null
  capacity: string | null
  brakes: string | null
  description: string | null
  soat: boolean
  matricula: boolean
  tecnomecanica: boolean
}

/**
 * Moto creada desde /admin/contenido (el cliente pidió poder "añadir otras
 * referencias" que build-catalog.mjs no generó). Los campos que no tiene la
 * tabla custom_motos (art, alarma, pedales...) llevan el valor por omisión
 * más común en el catálogo real; `source: 'nuevo'` ya existía en el tipo
 * Moto para justo este caso.
 */
function desdeCustom(f: FilaCustomMoto): MotoConEstado {
  return {
    id: f.id,
    name: f.name,
    category: f.category as Moto['category'],
    art: 'street',
    price: f.price ?? undefined,
    oldPrice: f.on_sale && f.old_price ? f.old_price : undefined,
    image: f.image ?? undefined,
    range: f.range ?? undefined,
    speed: f.speed ?? undefined,
    power: f.power ?? undefined,
    battery: f.battery ?? undefined,
    capacity: f.capacity ?? undefined,
    brakes: f.brakes ?? undefined,
    description: f.description ?? undefined,
    alarm: true,
    pedals: true,
    led: true,
    stop: true,
    parkingLights: false,
    soat: f.soat,
    matricula: f.matricula,
    tecnomecanica: f.tecnomecanica,
    source: 'nuevo',
    published: true, // ya vino filtrado por el endpoint público
    custom: true,
  }
}

/**
 * Igual que `photoOf` (en el archivo generado), pero reconoce una imagen
 * subida desde el panel: si `image` ya es una URL completa (Blob), se usa tal
 * cual, sin las variantes @2x locales que esa foto nunca tuvo.
 */
export function photoOfLive(m: MotoConEstado) {
  if (m.image?.startsWith('http')) return { src: m.image, srcSet: undefined }
  return photoOf(m)
}

/**
 * Igual que `specsOf` (en el archivo generado), más SOAT, matrícula y
 * tecnomecánica para las motos creadas desde el panel: su formulario los pide
 * con casillas explícitas, así que son dato real y no pueden quedar guardados
 * sin verse. El resto del equipamiento (alarma, pedales…) no se muestra: esa
 * tabla no lo tiene y specsOf solo lo afirma en las fichas del cliente.
 * Solo `custom`, no `source: 'nuevo'`: las 'nuevo' del catálogo generado
 * traen esos tres campos por omisión, no porque alguien los haya marcado.
 */
export function specsOfLive(m: MotoConEstado) {
  const filas = specsOf(m)
  if (!m.custom) return filas
  const yn = (v: boolean) => (v ? 'Sí' : 'No')
  return [
    ...filas,
    { label: 'SOAT', value: yn(m.soat) },
    { label: 'Matrícula', value: yn(m.matricula) },
    { label: 'Tecnomecánica', value: yn(m.tecnomecanica) },
  ]
}

function calcularStats(motos: MotoConEstado[]) {
  const visibles = motos.filter((m) => m.published)
  const conPrecio = visibles.filter((m) => m.price)
  return {
    total: visibles.length,
    maxRange: Math.max(0, ...visibles.map((m) => m.range ?? 0)),
    maxSpeed: Math.max(0, ...visibles.map((m) => m.speed ?? 0)),
    maxPower: Math.max(0, ...visibles.map((m) => m.power ?? 0)),
    minPrice: conPrecio.length ? Math.min(...conPrecio.map((m) => m.price!)) : 0,
    offers: visibles.filter((m) => m.oldPrice).length,
    withPrice: conPrecio.length,
  }
}

type Estado = { motos: MotoConEstado[]; stats: ReturnType<typeof calcularStats> }

/** Solo las publicadas: así ningún componente tiene que acordarse de filtrar */
function construirEstado(motos: MotoConEstado[]): Estado {
  return { motos: motos.filter((m) => m.published), stats: calcularStats(motos) }
}

const CatalogoVivoContext = createContext<Estado | null>(null)

export function CatalogoVivoProvider({ children }: { children: ReactNode }) {
  const base = useMemo<Estado>(() => construirEstado(MOTOS_BASE.map((m) => aplicar(m))), [])
  const [estado, setEstado] = useState<Estado>(base)

  useEffect(() => {
    let cancelado = false
    Promise.all([
      fetch('/api/public/motos-overrides')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as Promise<{ ok: boolean; overrides?: Record<string, Override> } | null>,
      fetch('/api/public/custom-motos')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as Promise<{ ok: boolean; motos?: FilaCustomMoto[] } | null>,
    ]).then(([overridesRes, customRes]) => {
      if (cancelado) return
      const conocidas = overridesRes?.ok && overridesRes.overrides
        ? MOTOS_BASE.map((m) => aplicar(m, overridesRes.overrides![m.id]))
        : MOTOS_BASE.map((m) => aplicar(m))
      const nuevas = customRes?.ok && customRes.motos ? customRes.motos.map(desdeCustom) : []
      setEstado(construirEstado([...conocidas, ...nuevas]))
    })
    return () => {
      cancelado = true
    }
  }, [])

  return <CatalogoVivoContext.Provider value={estado}>{children}</CatalogoVivoContext.Provider>
}

/** Motos publicadas y cifras, ya con lo que haya cambiado el administrador */
export function useCatalogoVivo() {
  const ctx = useContext(CatalogoVivoContext)
  if (!ctx) throw new Error('useCatalogoVivo debe usarse dentro de <CatalogoVivoProvider>')
  return ctx
}
