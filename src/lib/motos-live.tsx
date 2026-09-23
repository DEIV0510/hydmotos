import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MOTOS as MOTOS_BASE, photoOf, type Moto } from '@/data/motos'

/**
 * Precio, precio anterior, oferta, publicado/oculto e imagen ya no salen solo
 * del archivo estático: el panel de administración (`/admin`) los guarda en
 * la base de datos, y esto los trae a la web pública.
 *
 * Si la petición falla (sin conexión, base de datos caída, primera visita
 * antes de que responda) se sigue mostrando el catálogo estático tal cual
 * está en el repo — nunca una pantalla vacía ni un error visible.
 */

export type MotoConEstado = Moto & { published: boolean }

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
