import { useEffect, useMemo, useState } from 'react'
import { formatCOP } from '@/data/motos'

export type MotoAdmin = {
  id: string
  name: string
  image: string | null
  category: string
  range: number | null
  speed: number | null
  power: number | null
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  updatedAt: string | null
}

const descuento = (precio: number | null, anterior: number | null) =>
  precio && anterior && anterior > precio ? Math.round(((anterior - precio) / anterior) * 100) : 0

function EditarModal({ moto, onCerrar, onGuardado }: { moto: MotoAdmin; onCerrar: () => void; onGuardado: (m: MotoAdmin) => void }) {
  const [price, setPrice] = useState(moto.price ? String(moto.price) : '')
  const [oldPrice, setOldPrice] = useState(moto.oldPrice ? String(moto.oldPrice) : '')
  const [onSale, setOnSale] = useState(moto.onSale)
  const [published, setPublished] = useState(moto.published)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onCerrar])

  const precioNum = price ? Number(price) : null
  const anteriorNum = oldPrice ? Number(oldPrice) : null
  const pct = descuento(precioNum, onSale ? anteriorNum : null)

  const guardar = async () => {
    setError('')
    if (price && (!Number.isInteger(Number(price)) || Number(price) <= 0)) {
      return setError('El precio debe ser un número entero positivo.')
    }
    if (oldPrice && (!Number.isInteger(Number(oldPrice)) || Number(oldPrice) <= 0)) {
      return setError('El precio anterior debe ser un número entero positivo.')
    }
    setGuardando(true)
    try {
      const cuerpo = {
        motoId: moto.id,
        price: precioNum,
        oldPrice: anteriorNum,
        onSale,
        published,
      }
      const r = await fetch('/api/admin/motos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudieron guardar los cambios. Intenta nuevamente.')
        return
      }
      onGuardado({ ...moto, ...cuerpo, updatedAt: new Date().toISOString() })
    } catch {
      setError('No se pudieron guardar los cambios. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="editar-moto-titulo">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl">
        <h2 id="editar-moto-titulo" className="font-display text-[1.3rem] font-bold text-ink">
          {moto.name}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="m-price" className="mb-1 block text-[12.5px] font-medium text-slate">
              Precio
            </label>
            <input
              id="m-price"
              type="number"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Sin precio → “Precio por WhatsApp”"
              className="h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] outline-none focus-visible:border-blue"
            />
            {precioNum ? <p className="mt-1 text-[11.5px] text-slate">{formatCOP(precioNum)}</p> : null}
          </div>

          <div>
            <label htmlFor="m-old" className="mb-1 block text-[12.5px] font-medium text-slate">
              Precio anterior
            </label>
            <input
              id="m-old"
              type="number"
              min={0}
              step={1000}
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] outline-none focus-visible:border-blue"
            />
            {anteriorNum ? <p className="mt-1 text-[11.5px] text-slate">{formatCOP(anteriorNum)}</p> : null}
          </div>

          <label className="flex min-h-[40px] items-center gap-2.5 text-[13.5px] text-ink">
            <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="h-4 w-4" />
            Oferta activa
            {onSale && pct > 0 && (
              <span className="rounded-md bg-red-btn px-1.5 py-0.5 text-[11px] font-bold text-white">−{pct}%</span>
            )}
          </label>

          <label className="flex min-h-[40px] items-center gap-2.5 text-[13.5px] text-ink">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
            Publicado (visible en la web)
          </label>

          {error && (
            <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="min-h-[46px] flex-1 rounded-full border border-ink/15 text-[13px] font-bold uppercase tracking-widest2 text-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="min-h-[46px] flex-1 rounded-full bg-blue text-[13px] font-bold uppercase tracking-widest2 text-white disabled:opacity-60"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MotosList() {
  const [motos, setMotos] = useState<MotoAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<MotoAdmin | null>(null)
  const [aviso, setAviso] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    setError('')
    fetch('/api/admin/motos')
      .then((r) => r.json())
      .then((d) => (d.ok ? setMotos(d.motos) : setError('No se pudieron cargar las motos.')))
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }

  useEffect(cargar, [])

  const filtradas = useMemo(() => {
    if (!motos) return []
    const q = busqueda.trim().toLowerCase()
    return q ? motos.filter((m) => m.name.toLowerCase().includes(q)) : motos
  }, [motos, busqueda])

  const guardarCambios = (actualizada: MotoAdmin) => {
    setMotos((prev) => prev && prev.map((m) => (m.id === actualizada.id ? actualizada : m)))
    setEditando(null)
    setAviso('Cambios guardados.')
    setTimeout(() => setAviso(''), 3000)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Motos</h1>
          <p className="mt-1 text-[13.5px] text-slate">
            {motos ? `${motos.length} modelos` : 'Cargando…'}
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre…"
          className="h-11 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3.5 text-[14px] outline-none focus-visible:border-blue"
        />
      </div>

      {aviso && <p className="mt-4 rounded-lg bg-blue/10 px-3.5 py-2 text-[13px] text-blue-deep">{aviso}</p>}
      {error && <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2 text-[13px] text-red">{error}</p>}

      {!motos && !error && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-ink/10 bg-white" />
          ))}
        </div>
      )}

      {motos && (
        <ul className="mt-6 space-y-2.5">
          {filtradas.map((m) => {
            const pct = descuento(m.price, m.oldPrice)
            return (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-3.5 shadow-card sm:flex-nowrap"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper2">
                  {m.image && (
                    <img
                      src={`/motos/${m.image}.webp`}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                <div className="min-w-[140px] flex-1">
                  <p className="truncate font-semibold text-ink">{m.name}</p>
                  <p className="text-[12px] text-slate">
                    {m.range ? `${m.range} km` : '—'} · {m.speed ? `${m.speed} km/h` : '—'} ·{' '}
                    {m.power ? `${m.power} W` : '—'}
                  </p>
                </div>

                <div className="min-w-[130px]">
                  {m.price ? (
                    <>
                      <p className="font-display font-bold text-ink">{formatCOP(m.price)}</p>
                      {m.onSale && m.oldPrice && (
                        <p className="text-[11.5px] text-slate line-through">{formatCOP(m.oldPrice)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[12.5px] font-semibold uppercase text-blue-deep">Por WhatsApp</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {m.onSale && pct > 0 && (
                    <span className="rounded-md bg-red-btn px-2 py-1 text-[10.5px] font-bold text-white">−{pct}%</span>
                  )}
                  <span
                    className={`rounded-md px-2 py-1 text-[10.5px] font-bold uppercase ${
                      m.published ? 'bg-green-600/15 text-green-800' : 'bg-ink/10 text-slate'
                    }`}
                  >
                    {m.published ? 'Publicado' : 'Oculto'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditando(m)}
                  className="min-h-[40px] shrink-0 rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink hover:border-blue/40 hover:text-blue-deep"
                >
                  Editar
                </button>
              </li>
            )
          })}
          {motos && filtradas.length === 0 && (
            <p className="py-10 text-center text-[13.5px] text-slate">Sin resultados para “{busqueda}”.</p>
          )}
        </ul>
      )}

      {editando && <EditarModal moto={editando} onCerrar={() => setEditando(null)} onGuardado={guardarCambios} />}
    </div>
  )
}
