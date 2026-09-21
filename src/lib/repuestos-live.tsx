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

/** Igual que `photoOfPart`, pero reconoce una imagen subida desde el panel (URL completa de Blob). */
export function photoOfPartLive(r: RepuestoConEstado) {
  if (r.image?.startsWith('http')) return { src: r.image, src2x: r.image, srcSet: undefined }
  return photoOfPart(r)
}

type Estado = { repuestos: RepuestoConEstado[] }

function construirEstado(repuestos: RepuestoConEstado[]): Estado {
  return { repuestos: repuestos.filter((r) => r.published) }
}

const RepuestosVivoContext = createContext<Estado | null>(null)

export function RepuestosVivoProvider({ children }: { children: ReactNode }) {
  const base = useMemo<Estado>(() => construirEstado(REPUESTOS_BASE.map((r) => aplicar(r))), [])
  const [estado, setEstado] = useState<Estado>(base)

  useEffect(() => {
    let cancelado = false
    fetch('/api/public/repuestos-overrides')
      .then((r) => (r.ok ? r.json() : null))
      .then((datos: { ok: boolean; overrides?: Record<string, Override> } | null) => {
        if (cancelado || !datos?.ok || !datos.overrides) return
        setEstado(construirEstado(REPUESTOS_BASE.map((r) => aplicar(r, datos.overrides![r.id]))))
      })
      .catch(() => {
        /* sin overrides disponibles: se queda con el catálogo estático */
      })
    return () => {
      cancelado = true
    }
  }, [])

  return <RepuestosVivoContext.Provider value={estado}>{children}</RepuestosVivoContext.Provider>
}

export function useRepuestosVivo() {
  const ctx = useContext(RepuestosVivoContext)
  if (!ctx) throw new Error('useRepuestosVivo debe usarse dentro de <RepuestosVivoProvider>')
  return ctx
}
