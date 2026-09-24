import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { REPUESTOS as REPUESTOS_BASE, photoOfPart, type Repuesto } from '@/data/repuestos'

/**
 * Mismo patrón que src/lib/motos-live.tsx, para repuestos: precio, precio
 * anterior, oferta, publicado/oculto e imagen vienen del panel (Fase 2) y se
 * fusionan sobre el catálogo estático generado del Excel.
 */

export type RepuestoConEstado = Repuesto & { published: boolean }

type Override = {
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  image: string | null
}

function aplicar(base: Repuesto, o?: Override): RepuestoConEstado {
  if (!o) return { ...base, published: true }
  return {
    ...base,
    price: o.price ?? undefined,
    oldPrice: o.onSale && o.oldPrice ? o.oldPrice : undefined,
    published: o.published,
    image: o.image ?? base.image,
  }
}

type FilaCustomRepuesto = {
  id: string
  name: string
  category: string
  sub: string | null
  sku: string | null
  icon: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  image: string | null
  description: string | null
}

/** Repuesto creado desde /admin/contenido, igual que desdeCustom() en motos-live.tsx */
function desdeCustom(f: FilaCustomRepuesto): RepuestoConEstado {
  return {
    id: f.id,
    name: f.name,
    category: f.category,
    sub: f.sub ?? undefined,
    sku: f.sku ?? undefined,
    icon: f.icon as Repuesto['icon'],
    price: f.price ?? undefined,
    oldPrice: f.on_sale && f.old_price ? f.old_price : undefined,
    image: f.image ?? undefined,
    description: f.description ?? undefined,
    published: true,
  }
}

/** Igual que `photoOfPart`, pero reconoce una imagen subida desde el panel (URL completa de Blob). */
export function photoOfPartLive(r: RepuestoConEstado) {
  if (r.image?.startsWith('http')) return { src: r.image, src2x: r.image, srcSet: undefined }
  return photoOfPart(r)
}

/**
 * Cifras de los repuestos que se ven en la web. Reemplazan a STATS_REPUESTOS
 * (del archivo generado), que no sabía de los ocultos ni de los creados desde
 * el panel.
 */
function calcularStats(visibles: RepuestoConEstado[]) {
  const conPrecio = visibles.filter((r) => r.price)
  return {
    total: visibles.length,
    categorias: new Set(visibles.map((r) => r.category)).size,
    conPrecio: conPrecio.length,
    minPrice: conPrecio.length ? Math.min(...conPrecio.map((r) => r.price!)) : 0,
  }
}

type Estado = { repuestos: RepuestoConEstado[]; stats: ReturnType<typeof calcularStats> }

function construirEstado(repuestos: RepuestoConEstado[]): Estado {
  const visibles = repuestos.filter((r) => r.published)
  return { repuestos: visibles, stats: calcularStats(visibles) }
}

const RepuestosVivoContext = createContext<Estado | null>(null)

export function RepuestosVivoProvider({ children }: { children: ReactNode }) {
  const base = useMemo<Estado>(() => construirEstado(REPUESTOS_BASE.map((r) => aplicar(r))), [])
  const [estado, setEstado] = useState<Estado>(base)

  useEffect(() => {
    let cancelado = false
    Promise.all([
      fetch('/api/public/repuestos-overrides')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as Promise<{ ok: boolean; overrides?: Record<string, Override> } | null>,
      fetch('/api/public/custom-repuestos')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as Promise<{ ok: boolean; repuestos?: FilaCustomRepuesto[] } | null>,
    ]).then(([overridesRes, customRes]) => {
      if (cancelado) return
      const conocidos = overridesRes?.ok && overridesRes.overrides
        ? REPUESTOS_BASE.map((r) => aplicar(r, overridesRes.overrides![r.id]))
        : REPUESTOS_BASE.map((r) => aplicar(r))
      const nuevos = customRes?.ok && customRes.repuestos ? customRes.repuestos.map(desdeCustom) : []
      setEstado(construirEstado([...conocidos, ...nuevos]))
    })
    return () => {
      cancelado = true
    }
  }, [])

  return <RepuestosVivoContext.Provider value={estado}>{children}</RepuestosVivoContext.Provider>
}

/** Repuestos publicados y sus cifras, ya con lo que haya cambiado el administrador */
export function useRepuestosVivo() {
  const ctx = useContext(RepuestosVivoContext)
  if (!ctx) throw new Error('useRepuestosVivo debe usarse dentro de <RepuestosVivoProvider>')
  return ctx
}
