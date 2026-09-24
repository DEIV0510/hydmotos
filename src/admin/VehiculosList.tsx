import { useEffect, useRef, useState } from 'react'
import { formatCOP } from '@/data/motos'
import type { Imagen } from '@/lib/vehiculos-live'
import { subirImagen } from './ImageUpload'

type Tipo = 'patineta' | 'carro'

type VehiculoAdmin = {
  id: string
  tipo: Tipo
  name: string
  detail: string | null
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
  images: Imagen[]
  description: string | null
  range: number | null
  speed: number | null
  orden: number
}

const TEXTOS = {
  patineta: {
    titulo: 'Patinetas',
    nuevo: '+ Nueva patineta',
    crear: 'Crear patineta',
    vacio: 'Todavía no hay patinetas. Mientras tanto, la sección del sitio invita a preguntar por WhatsApp.',
    detalle: 'Ej. 25 km/h · plegable',
  },
  carro: {
    titulo: 'Carros',
    nuevo: '+ Nuevo carro',
    crear: 'Crear carro',
    vacio: 'No hay carros. Mientras tanto, la sección del sitio invita a preguntar por WhatsApp.',
    detalle: 'Ej. 5 puertas · techo blanco',
  },
} as const

const MAX_FOTOS = 12

/**
 * Galería del vehículo, en el orden en que se verá: la primera es la foto
 * principal. Sube cada imagen apenas se elige (mismo endpoint y mismas reglas
 * que ImageUpload) y deja reordenar o quitar.
 */
function GaleriaEditor({ imagenes, onChange }: { imagenes: Imagen[]; onChange: (i: Imagen[]) => void }) {
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= imagenes.length) return
    const copia = [...imagenes]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    onChange(copia)
  }

  const agregar = async (files: FileList | null) => {
    if (!files?.length) return
    setError('')
    const lista = [...files].slice(0, MAX_FOTOS - imagenes.length)
    // La prop `imagenes` no cambia dentro de este bucle: se acumula aquí
    let actuales = imagenes
    for (let k = 0; k < lista.length; k++) {
      setEstado(`Subiendo ${k + 1} de ${lista.length}…`)
      try {
        const url = await subirImagen(lista[k], 'vehiculos', 'vehiculo')
        actuales = [...actuales, { src: url }]
        onChange(actuales)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo subir una de las fotos.')
        break
      }
    }
    setEstado('')
  }

  return (
    <div>
      {imagenes.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {imagenes.map((img, i) => (
            <li key={img.src} className="overflow-hidden rounded-lg border border-ink/15 bg-paper2">
              <div className="relative aspect-[4/3]">
                <img src={img.src} alt="" className="h-full w-full object-contain" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-blue px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-white">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex border-t border-ink/10 text-[13px]">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="h-8 flex-1 disabled:opacity-30" aria-label="Mover antes">
                  ←
                </button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === imagenes.length - 1} className="h-8 flex-1 disabled:opacity-30" aria-label="Mover después">
                  →
                </button>
                <button
                  type="button"
                  onClick={() => onChange(imagenes.filter((_, k) => k !== i))}
                  className="h-8 flex-1 text-red"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-ink/20 px-3 py-4 text-center text-[12.5px] text-slate">
          Sin fotos: en el sitio se verá «Foto pendiente».
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={Boolean(estado) || imagenes.length >= MAX_FOTOS}
          className="min-h-[40px] rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink hover:border-blue/40 hover:text-blue-deep disabled:opacity-50"
        >
          {estado || 'Agregar fotos'}
        </button>
        <p className="text-[11px] text-slate">JPG, PNG o WEBP · máx. 3 MB c/u · hasta {MAX_FOTOS}</p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => {
          const files = e.target.files
          agregar(files).finally(() => {
            if (input.current) input.current.value = ''
          })
        }}
        className="sr-only"
        aria-label="Elegir fotos"
      />
      {error && (
        <p role="alert" className="mt-2 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
          {error}
        </p>
      )}
    </div>
  )
}

function Modal({
  tipo,
  vehiculo,
  onCerrar,
  onGuardado,
}: {
  tipo: Tipo
  /** null = creando uno nuevo */
  vehiculo: VehiculoAdmin | null
  onCerrar: () => void
  onGuardado: (v: VehiculoAdmin | null, eliminadoId?: string) => void
}) {
  const t = TEXTOS[tipo]
  const [name, setName] = useState(vehiculo?.name ?? '')
  const [detail, setDetail] = useState(vehiculo?.detail ?? '')
  const [price, setPrice] = useState(vehiculo?.price ? String(vehiculo.price) : '')
  const [oldPrice, setOldPrice] = useState(vehiculo?.old_price ? String(vehiculo.old_price) : '')
  const [onSale, setOnSale] = useState(vehiculo?.on_sale ?? false)
  const [published, setPublished] = useState(vehiculo?.published ?? true)
  const [images, setImages] = useState<Imagen[]>(vehiculo?.images ?? [])
  const [description, setDescription] = useState(vehiculo?.description ?? '')
  const [range, setRange] = useState(vehiculo?.range ? String(vehiculo.range) : '')
  const [speed, setSpeed] = useState(vehiculo?.speed ? String(vehiculo.speed) : '')
  const [orden, setOrden] = useState(vehiculo ? String(vehiculo.orden) : '')
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onCerrar])

  const entero = (v: string) => (v.trim() ? Number(v) : null)

  const guardar = async () => {
    setError('')
    if (!name.trim()) return setError('El nombre es obligatorio.')
    for (const [v, etiqueta] of [
      [price, 'El precio'],
      [oldPrice, 'El precio anterior'],
    ] as const) {
      if (v && (!Number.isInteger(Number(v)) || Number(v) <= 0)) return setError(`${etiqueta} debe ser un número entero positivo.`)
    }
    setGuardando(true)
    try {
      const cuerpo = {
        id: vehiculo?.id,
        tipo,
        name: name.trim(),
        detail: detail.trim() || null,
        price: entero(price),
        oldPrice: entero(oldPrice),
        onSale,
        published,
        images,
        description: description.trim() || null,
        range: entero(range),
        speed: entero(speed),
        orden: entero(orden),
      }
      const r = await fetch('/api/admin/vehiculos', {
        method: vehiculo ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) return setError(d.error || 'No se pudieron guardar los cambios.')
      onGuardado({
        id: vehiculo?.id ?? d.id,
        tipo,
        name: cuerpo.name,
        detail: cuerpo.detail,
        price: cuerpo.price,
        old_price: cuerpo.oldPrice,
        on_sale: onSale,
        published,
        images,
        description: cuerpo.description,
        range: cuerpo.range,
        speed: cuerpo.speed,
        orden: cuerpo.orden ?? d.orden ?? vehiculo?.orden ?? 0,
      })
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!vehiculo) return
    setEliminando(true)
    setError('')
    try {
      const r = await fetch(`/api/admin/vehiculos?id=${encodeURIComponent(vehiculo.id)}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok || !d.ok) return setError(d.error || 'No se pudo eliminar.')
      onGuardado(null, vehiculo.id)
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setEliminando(false)
    }
  }

  const campo = 'h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] outline-none focus-visible:border-blue'
  const etiqueta = 'mb-1 block text-[12.5px] font-medium text-slate'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center overflow-y-auto bg-ink/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehiculo-titulo"
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-lift sm:my-8 sm:rounded-2xl">
        <h2 id="vehiculo-titulo" className="font-display text-[1.3rem] font-bold text-ink">
          {vehiculo ? `Editar ${vehiculo.name}` : t.nuevo.replace('+ ', '')}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <p className={etiqueta}>Fotos (la primera es la principal)</p>
            <GaleriaEditor imagenes={images} onChange={setImages} />
          </div>

          <div>
            <label className={etiqueta} htmlFor="v-name">Nombre *</label>
            <input id="v-name" className={campo} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={etiqueta} htmlFor="v-detail">Detalle corto</label>
            <input id="v-detail" className={campo} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t.detalle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiqueta} htmlFor="v-price">Precio</label>
              <input id="v-price" type="number" min={0} step={1000} className={campo} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Vacío = por WhatsApp" />
              {entero(price) ? <p className="mt-1 text-[11.5px] text-slate">{formatCOP(Number(price))}</p> : null}
            </div>
            <div>
              <label className={etiqueta} htmlFor="v-old">Precio anterior</label>
              <input id="v-old" type="number" min={0} step={1000} className={campo} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={etiqueta} htmlFor="v-range">Autonomía (km)</label>
              <input id="v-range" type="number" min={0} className={campo} value={range} onChange={(e) => setRange(e.target.value)} />
            </div>
            <div>
              <label className={etiqueta} htmlFor="v-speed">Velocidad (km/h)</label>
              <input id="v-speed" type="number" min={0} className={campo} value={speed} onChange={(e) => setSpeed(e.target.value)} />
            </div>
            <div>
              <label className={etiqueta} htmlFor="v-orden">Orden</label>
              <input id="v-orden" type="number" min={0} className={campo} value={orden} onChange={(e) => setOrden(e.target.value)} placeholder="Al final" />
            </div>
          </div>

          <div>
            <label className={etiqueta} htmlFor="v-desc">Descripción</label>
            <textarea id="v-desc" rows={3} className={campo.replace('h-11', 'py-2.5')} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="h-4 w-4" />
              Oferta activa
            </label>
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
              Publicado (visible en la web)
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
              {error}
            </p>
          )}

          {vehiculo && !confirmarEliminar && (
            <button type="button" onClick={() => setConfirmarEliminar(true)} className="text-[12.5px] font-semibold text-red hover:underline">
              Eliminar
            </button>
          )}
          {vehiculo && confirmarEliminar && (
            <div className="rounded-lg border border-red/30 bg-red/10 p-3">
              <p className="text-[13px] text-ink">¿Eliminar «{vehiculo.name}» de verdad? No se puede deshacer.</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={eliminar} disabled={eliminando} className="min-h-[38px] rounded-full bg-red px-4 text-[12px] font-bold uppercase tracking-widest2 text-white disabled:opacity-60">
                  {eliminando ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
                <button type="button" onClick={() => setConfirmarEliminar(false)} className="min-h-[38px] rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCerrar} className="min-h-[46px] flex-1 rounded-full border border-ink/15 text-[13px] font-bold uppercase tracking-widest2 text-ink">
            Cancelar
          </button>
          <button type="button" onClick={guardar} disabled={guardando} className="min-h-[46px] flex-1 rounded-full bg-blue text-[13px] font-bold uppercase tracking-widest2 text-white disabled:opacity-60">
            {guardando ? 'Guardando…' : vehiculo ? 'Guardar' : t.crear}
          </button>
        </div>
      </div>
    </div>
  )
}

/** /admin/patinetas y /admin/carros: misma pantalla, distinto tipo */
export default function VehiculosList({ tipo }: { tipo: Tipo }) {
  const t = TEXTOS[tipo]
  const [lista, setLista] = useState<VehiculoAdmin[] | null>(null)
  const [error, setError] = useState('')
  /** undefined = cerrado; null = creando; VehiculoAdmin = editando */
  const [editando, setEditando] = useState<VehiculoAdmin | null | undefined>(undefined)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    setLista(null)
    setError('')
    fetch('/api/admin/vehiculos')
      .then((r) => r.json())
      .then((d) =>
        d.ok ? setLista((d.vehiculos as VehiculoAdmin[]).filter((v) => v.tipo === tipo)) : setError('No se pudo cargar la lista.'),
      )
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }, [tipo])

  const alGuardar = (v: VehiculoAdmin | null, eliminadoId?: string) => {
    setLista((prev) => {
      if (!prev) return prev
      if (eliminadoId) return prev.filter((x) => x.id !== eliminadoId)
      if (!v) return prev
      const siguiente = prev.some((x) => x.id === v.id) ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v]
      return siguiente.sort((a, b) => a.orden - b.orden)
    })
    setEditando(undefined)
    setAviso(eliminadoId ? 'Eliminado.' : 'Cambios guardados y ya visibles en la web.')
    setTimeout(() => setAviso(''), 3500)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">{t.titulo}</h1>
          <p className="mt-1 text-[13.5px] text-slate">{lista ? `${lista.length} en el panel` : 'Cargando…'}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditando(null)}
          className="min-h-[44px] shrink-0 rounded-full bg-blue px-5 text-[12px] font-bold uppercase tracking-widest2 text-white"
        >
          {t.nuevo}
        </button>
      </div>

      {aviso && <p className="mt-4 rounded-lg bg-blue/10 px-3.5 py-2 text-[13px] text-blue-deep">{aviso}</p>}
      {error && <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2 text-[13px] text-red">{error}</p>}

      {!lista && !error && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-ink/10 bg-white" />
          ))}
        </div>
      )}

      {lista && lista.length === 0 && <p className="mt-8 text-[13.5px] text-slate">{t.vacio}</p>}

      {lista && lista.length > 0 && (
        <ul className="mt-6 space-y-2.5">
          {lista.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-ink/10 bg-white p-3.5 shadow-card sm:flex-nowrap">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-paper2">
                {v.images[0] && <img src={v.images[0].src} alt="" loading="lazy" className="h-full w-full object-contain" />}
              </div>
              <div className="min-w-[140px] flex-1">
                <p className="truncate font-semibold text-ink">{v.name}</p>
                <p className="text-[12px] text-slate">
                  {[v.detail, `${v.images.length} ${v.images.length === 1 ? 'foto' : 'fotos'}`].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="min-w-[120px]">
                {v.price ? (
                  <p className="font-display font-bold text-ink">{formatCOP(v.price)}</p>
                ) : (
                  <p className="text-[12.5px] font-semibold uppercase text-blue-deep">Por WhatsApp</p>
                )}
              </div>
              <span
                className={`rounded-md px-2 py-1 text-[10.5px] font-bold uppercase ${
                  v.published ? 'bg-green-600/15 text-green-800' : 'bg-ink/10 text-slate'
                }`}
              >
                {v.published ? 'Publicado' : 'Oculto'}
              </span>
              <button
                type="button"
                onClick={() => setEditando(v)}
                className="min-h-[40px] shrink-0 rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink hover:border-blue/40 hover:text-blue-deep"
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      )}

      {editando !== undefined && (
        <Modal tipo={tipo} vehiculo={editando} onCerrar={() => setEditando(undefined)} onGuardado={alGuardar} />
      )}
    </div>
  )
}
