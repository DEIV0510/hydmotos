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
    fetch('/api/public/motos-overrides')
      .then((r) => (r.ok ? r.json() : null))
      .then((datos: { ok: boolean; overrides?: Record<string, Override> } | null) => {
        if (cancelado || !datos?.ok || !datos.overrides) return
        setEstado(construirEstado(MOTOS_BASE.map((m) => aplicar(m, datos.overrides![m.id]))))
      })
      .catch(() => {
        /* sin overrides disponibles: se queda con el catálogo estático */
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
