import { useEffect, useMemo, useState } from 'react'
import { formatCOP } from '@/data/motos'
import ImageUpload from './ImageUpload'

export type RepuestoAdmin = {
  id: string
  name: string
  category: string
  sku: string | null
  image: string | null
  price: number | null
  oldPrice: number | null
  onSale: boolean
  published: boolean
  updatedAt: string | null
}

const descuento = (precio: number | null, anterior: number | null) =>
  precio && anterior && anterior > precio ? Math.round(((anterior - precio) / anterior) * 100) : 0

/** `image` puede ser el nombre local del catálogo estático o una URL completa
 * de Blob si el admin ya cambió la foto. */
const urlDeImagen = (image: string | null) =>
  !image ? null : image.startsWith('http') ? image : `/repuestos/${image}.webp`

function EditarModal({
  repuesto,
  onCerrar,
  onGuardado,
}: {
  repuesto: RepuestoAdmin
  onCerrar: () => void
  onGuardado: (r: RepuestoAdmin) => void
}) {
  const [price, setPrice] = useState(repuesto.price ? String(repuesto.price) : '')
  const [oldPrice, setOldPrice] = useState(repuesto.oldPrice ? String(repuesto.oldPrice) : '')
  const [onSale, setOnSale] = useState(repuesto.onSale)
  const [published, setPublished] = useState(repuesto.published)
  const [image, setImage] = useState<string | undefined>(undefined)
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
        repuestoId: repuesto.id,
        price: precioNum,
        oldPrice: anteriorNum,
        onSale,
        published,
        image,
      }
      const r = await fetch('/api/admin/repuestos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudieron guardar los cambios. Intenta nuevamente.')
        return
      }
      onGuardado({ ...repuesto, ...cuerpo, image: image ?? repuesto.image, updatedAt: new Date().toISOString() })
    } catch {
      setError('No se pudieron guardar los cambios. Intenta nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-repuesto-titulo"
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lift sm:rounded-2xl">
        <h2 id="editar-repuesto-titulo" className="font-display text-[1.3rem] font-bold text-ink">
          {repuesto.name}
        </h2>
        {repuesto.sku && <p className="mt-0.5 text-[12px] text-slate">Ref. {repuesto.sku}</p>}

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1.5 block text-[12.5px] font-medium text-slate">Imagen</p>
            <ImageUpload
              carpeta="repuestos"
              id={repuesto.id}
              valorActual={urlDeImagen(image ?? repuesto.image)}
              onSubido={setImage}
            />
          </div>

          <div>
            <label htmlFor="r-price" className="mb-1 block text-[12.5px] font-medium text-slate">
              Precio
            </label>
            <input
              id="r-price"
              type="number"
              min={0}
              step={1000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Sin precio → “Consultar”"
              className="h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] outline-none focus-visible:border-blue"
            />
            {precioNum ? <p className="mt-1 text-[11.5px] text-slate">{formatCOP(precioNum)}</p> : null}
          </div>

          <div>
            <label htmlFor="r-old" className="mb-1 block text-[12.5px] font-medium text-slate">
              Precio anterior
            </label>
            <input
              id="r-old"
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

export default function RepuestosList() {
  const [repuestos, setRepuestos] = useState<RepuestoAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<RepuestoAdmin | null>(null)
  const [aviso, setAviso] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    setError('')
    fetch('/api/admin/repuestos')
      .then((r) => r.json())
      .then((d) => (d.ok ? setRepuestos(d.repuestos) : setError('No se pudieron cargar los repuestos.')))
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }

  useEffect(cargar, [])

  const filtrados = useMemo(() => {
    if (!repuestos) return []
    const q = busqueda.trim().toLowerCase()
    return q
      ? repuestos.filter((r) => r.name.toLowerCase().includes(q) || r.sku?.toLowerCase().includes(q))
      : repuestos
  }, [repuestos, busqueda])

  const guardarCambios = (actualizado: RepuestoAdmin) => {
    setRepuestos((prev) => prev && prev.map((r) => (r.id === actualizado.id ? actualizado : r)))
    setEditando(null)
    setAviso('Cambios guardados.')
    setTimeout(() => setAviso(''), 3000)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Repuestos</h1>
          <p className="mt-1 text-[13.5px] text-slate">
            {repuestos ? `${repuestos.length} referencias` : 'Cargando…'}
          </p>
        </div>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o referencia…"
          className="h-11 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3.5 text-[14px] outline-none focus-visible:border-blue"
        />
      </div>

      {aviso && <p className="mt-4 rounded-lg bg-blue/10 px-3.5 py-2 text-[13px] text-blue-deep">{aviso}</p>}
      {error && <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2 text-[13px] text-red">{error}</p>}

      {!repuestos && !error && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-ink/10 bg-white" />
          ))}
        </div>
      )}

      {repuestos && (
        <ul className="mt-6 space-y-2.5">
          {filtrados.map((r) => {
            const pct = descuento(r.price, r.oldPrice)
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-3.5 shadow-card sm:flex-nowrap"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper2">
                  {urlDeImagen(r.image) && (
                    <img
                      src={urlDeImagen(r.image)!}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                <div className="min-w-[160px] flex-1">
                  <p className="truncate font-semibold text-ink">{r.name}</p>
                  <p className="text-[12px] text-slate">
                    {r.category}
                    {r.sku ? ` · Ref. ${r.sku}` : ''}
                  </p>
                </div>

                <div className="min-w-[130px]">
                  {r.price ? (
                    <>
                      <p className="font-display font-bold text-ink">{formatCOP(r.price)}</p>
                      {r.onSale && r.oldPrice && (
                        <p className="text-[11.5px] text-slate line-through">{formatCOP(r.oldPrice)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[12.5px] font-semibold uppercase text-blue-deep">Consultar</p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {r.onSale && pct > 0 && (
                    <span className="rounded-md bg-red-btn px-2 py-1 text-[10.5px] font-bold text-white">−{pct}%</span>
                  )}
                  <span
                    className={`rounded-md px-2 py-1 text-[10.5px] font-bold uppercase ${
                      r.published ? 'bg-green-600/15 text-green-800' : 'bg-ink/10 text-slate'
                    }`}
                  >
                    {r.published ? 'Publicado' : 'Oculto'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditando(r)}
                  className="min-h-[40px] shrink-0 rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink hover:border-blue/40 hover:text-blue-deep"
                >
                  Editar
                </button>
              </li>
            )
          })}
          {repuestos && filtrados.length === 0 && (
            <p className="py-10 text-center text-[13.5px] text-slate">Sin resultados para “{busqueda}”.</p>
          )}
        </ul>
      )}

      {editando && <EditarModal repuesto={editando} onCerrar={() => setEditando(null)} onGuardado={guardarCambios} />}
    </div>
  )
}
