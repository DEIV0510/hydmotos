import { useEffect, useState } from 'react'
import type { MotoAdmin } from './MotosList'

export default function Dashboard() {
  const [motos, setMotos] = useState<MotoAdmin[] | null>(null)

  useEffect(() => {
    fetch('/api/admin/motos')
      .then((r) => r.json())
      .then((d) => setMotos(d.ok ? d.motos : []))
      .catch(() => setMotos([]))
  }, [])

  const cifras = motos && [
    { l: 'Motos en el catálogo', v: motos.length },
    { l: 'Publicadas', v: motos.filter((m) => m.published).length },
    { l: 'Ocultas', v: motos.filter((m) => !m.published).length },
    { l: 'Con oferta activa', v: motos.filter((m) => m.onSale).length },
  ]

  return (
    <div>
      <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Dashboard</h1>
      <p className="mt-1 text-[13.5px] text-slate">Resumen del catálogo de motos.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cifras
          ? cifras.map((c) => (
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
        Por ahora el panel edita precio, precio anterior, oferta y publicado/oculto de las motos, en{' '}
        <span className="font-semibold text-ink">Motos</span>, en el menú. El resto (repuestos, imágenes,
        hero, banners, contacto…) llega en las próximas fases.
      </p>
    </div>
  )
}
