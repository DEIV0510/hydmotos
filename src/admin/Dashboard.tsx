import { useEffect, useState } from 'react'
import type { MotoAdmin } from './MotosList'
import type { RepuestoAdmin } from './RepuestosList'

export default function Dashboard() {
  const [motos, setMotos] = useState<MotoAdmin[] | null>(null)
  const [repuestos, setRepuestos] = useState<RepuestoAdmin[] | null>(null)

  useEffect(() => {
    fetch('/api/admin/motos')
      .then((r) => r.json())
      .then((d) => setMotos(d.ok ? d.motos : []))
      .catch(() => setMotos([]))
    fetch('/api/admin/repuestos')
      .then((r) => r.json())
      .then((d) => setRepuestos(d.ok ? d.repuestos : []))
      .catch(() => setRepuestos([]))
  }, [])

  const cifrasMotos = motos && [
    { l: 'Motos en el catálogo', v: motos.length },
    { l: 'Publicadas', v: motos.filter((m) => m.published).length },
    { l: 'Ocultas', v: motos.filter((m) => !m.published).length },
    { l: 'Con oferta activa', v: motos.filter((m) => m.onSale).length },
  ]

  const cifrasRepuestos = repuestos && [
    { l: 'Repuestos en el catálogo', v: repuestos.length },
    { l: 'Publicados', v: repuestos.filter((r) => r.published).length },
    { l: 'Ocultos', v: repuestos.filter((r) => !r.published).length },
    { l: 'Con oferta activa', v: repuestos.filter((r) => r.onSale).length },
  ]

  return (
    <div>
      <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Dashboard</h1>
      <p className="mt-1 text-[13.5px] text-slate">Resumen del catálogo.</p>

      <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">Motos</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cifrasMotos
          ? cifrasMotos.map((c) => (
              <div key={c.l} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
                <p className="font-display text-[1.9rem] font-extrabold leading-none text-ink">{c.v}</p>
                <p className="mt-1.5 text-[12px] text-slate">{c.l}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[84px] animate-pulse rounded-2xl border border-ink/10 bg-white" />
            ))}
      </div>

      <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">Repuestos</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cifrasRepuestos
          ? cifrasRepuestos.map((c) => (
              <div key={c.l} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
                <p className="font-display text-[1.9rem] font-extrabold leading-none text-ink">{c.v}</p>
                <p className="mt-1.5 text-[12px] text-slate">{c.l}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[84px] animate-pulse rounded-2xl border border-ink/10 bg-white" />
            ))}
      </div>

      <p className="mt-8 text-[12.5px] text-slate">
        En <span className="font-semibold text-ink">Motos</span> y{' '}
        <span className="font-semibold text-ink">Repuestos</span> se editan precio, oferta, publicado/oculto e
        imagen del catálogo, y con «+ Nueva» se agregan productos nuevos.{' '}
        <span className="font-semibold text-ink">Patinetas</span> y{' '}
        <span className="font-semibold text-ink">Carros</span> se cargan completos, con sus fotos. En{' '}
        <span className="font-semibold text-ink">Contenido</span> van el Hero, contacto, WhatsApp, SEO y menú del
        sitio.
      </p>
    </div>
  )
}
