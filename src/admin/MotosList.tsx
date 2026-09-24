import { useEffect, useMemo, useState } from 'react'
import { formatCOP } from '@/data/motos'
import ImageUpload from './ImageUpload'

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
  /** true = creada desde el panel (custom_motos): se puede editar todo y eliminar de verdad */
  custom?: boolean
  battery?: string | null
  capacity?: string | null
  brakes?: string | null
  description?: string | null
  soat?: boolean
  matricula?: boolean
  tecnomecanica?: boolean
}

const CATEGORIAS = [
  { id: 'urbana', label: 'Urbana' },
  { id: 'familiar', label: 'Familiar' },
  { id: 'matricula', label: 'Alta potencia' },
  { id: 'tricimotor', label: 'Tricimotor' },
]

const descuento = (precio: number | null, anterior: number | null) =>
  precio && anterior && anterior > precio ? Math.round(((anterior - precio) / anterior) * 100) : 0

/** `image` puede ser el slug local del catálogo estático ("urban") o una URL
 * completa de Blob si el admin ya cambió la foto: aquí se resuelve a una URL
 * que sí se puede mostrar en un <img>. */
const urlDeImagen = (image: string | null) =>
  !image ? null : image.startsWith('http') ? image : `/motos/${image}.webp`

function EditarModal({ moto, onCerrar, onGuardado }: { moto: MotoAdmin; onCerrar: () => void; onGuardado: (m: MotoAdmin) => void }) {
  const [price, setPrice] = useState(moto.price ? String(moto.price) : '')
  const [oldPrice, setOldPrice] = useState(moto.oldPrice ? String(moto.oldPrice) : '')
  const [onSale, setOnSale] = useState(moto.onSale)
  const [published, setPublished] = useState(moto.published)
  // undefined = no se tocó la imagen en este formulario: al guardar no se
  // manda esa clave y el servidor conserva lo que ya hubiera (nunca se manda
  // el slug local del catálogo estático, que no es una URL válida)
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
        motoId: moto.id,
        price: precioNum,
        oldPrice: anteriorNum,
        onSale,
        published,
        image,
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
      onGuardado({ ...moto, ...cuerpo, image: image ?? moto.image, updatedAt: new Date().toISOString() })
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
            <p className="mb-1.5 block text-[12.5px] font-medium text-slate">Imagen principal</p>
            <ImageUpload
              carpeta="motos"
              id={moto.id}
              valorActual={urlDeImagen(image ?? moto.image)}
              onSubido={setImage}
            />
          </div>

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
            <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red-deep">
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

/**
 * Crear o editar una moto que NO viene del catálogo generado (custom_motos):
 * el cliente pidió poder "añadir otras referencias" (nota de voz, 23/09).
 * Modal aparte del de arriba para no arriesgar el que ya funciona con las
 * 80 motos del catálogo: este maneja más campos (los que hacen falta para
 * que la ficha se vea completa) y sí permite eliminar de verdad.
 */
function CrearEditarModal({
  moto,
  onCerrar,
  onGuardado,
}: {
  /** null = creando una nueva */
  moto: MotoAdmin | null
  onCerrar: () => void
  onGuardado: (m: MotoAdmin, eliminada?: boolean) => void
}) {
  const [name, setName] = useState(moto?.name ?? '')
  const [category, setCategory] = useState(moto?.category ?? 'urbana')
  const [price, setPrice] = useState(moto?.price ? String(moto.price) : '')
  const [oldPrice, setOldPrice] = useState(moto?.oldPrice ? String(moto.oldPrice) : '')
  const [onSale, setOnSale] = useState(moto?.onSale ?? false)
  const [published, setPublished] = useState(moto?.published ?? true)
  const [range, setRange] = useState(moto?.range ? String(moto.range) : '')
  const [speed, setSpeed] = useState(moto?.speed ? String(moto.speed) : '')
  const [power, setPower] = useState(moto?.power ? String(moto.power) : '')
  const [battery, setBattery] = useState(moto?.battery ?? '')
  const [capacity, setCapacity] = useState(moto?.capacity ?? '')
  const [brakes, setBrakes] = useState(moto?.brakes ?? '')
  const [description, setDescription] = useState(moto?.description ?? '')
  const [soat, setSoat] = useState(moto?.soat ?? false)
  const [matricula, setMatricula] = useState(moto?.matricula ?? false)
  const [tecnomecanica, setTecnomecanica] = useState(moto?.tecnomecanica ?? false)
  const [image, setImage] = useState<string | undefined>(undefined)
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
    if (price && (!Number.isInteger(Number(price)) || Number(price) <= 0)) {
      return setError('El precio debe ser un número entero positivo.')
    }
    setGuardando(true)
    try {
      const cuerpo = {
        id: moto?.id,
        name: name.trim(),
        category,
        price: entero(price),
        oldPrice: entero(oldPrice),
        onSale,
        published,
        range: entero(range),
        speed: entero(speed),
        power: entero(power),
        battery: battery.trim() || null,
        capacity: capacity.trim() || null,
        brakes: brakes.trim() || null,
        description: description.trim() || null,
        soat,
        matricula,
        tecnomecanica,
        image,
      }
      const r = await fetch('/api/admin/custom-motos', {
        method: moto ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudieron guardar los cambios.')
        return
      }
      onGuardado({
        id: moto?.id ?? d.id,
        name: cuerpo.name,
        category: cuerpo.category,
        image: image ?? moto?.image ?? null,
        range: cuerpo.range,
        speed: cuerpo.speed,
        power: cuerpo.power,
        price: cuerpo.price,
        oldPrice: cuerpo.oldPrice,
        onSale: cuerpo.onSale,
        published: cuerpo.published,
        updatedAt: new Date().toISOString(),
        custom: true,
        battery: cuerpo.battery,
        capacity: cuerpo.capacity,
        brakes: cuerpo.brakes,
        description: cuerpo.description,
        soat: cuerpo.soat,
        matricula: cuerpo.matricula,
        tecnomecanica: cuerpo.tecnomecanica,
      })
    } catch {
      setError('No se pudo conectar con el servidor.')
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!moto) return
    setEliminando(true)
    setError('')
    try {
      const r = await fetch(`/api/admin/custom-motos?id=${encodeURIComponent(moto.id)}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudo eliminar.')
        return
      }
      onGuardado(moto, true)
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
      aria-labelledby="crear-moto-titulo"
    >
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-lift sm:my-8 sm:rounded-2xl">
        <h2 id="crear-moto-titulo" className="font-display text-[1.3rem] font-bold text-ink">
          {moto ? `Editar ${moto.name}` : 'Nueva moto'}
        </h2>
        <p className="mt-1 text-[12.5px] text-slate">
          {moto ? 'Producto creado desde el panel.' : 'Se agrega al catálogo público al guardar.'}
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <p className={etiqueta}>Imagen principal</p>
            <ImageUpload carpeta="motos" id="nueva-moto" valorActual={image ?? (moto?.image?.startsWith('http') ? moto.image : null)} onSubido={setImage} />
          </div>

          <div>
            <label className={etiqueta} htmlFor="nm-name">Nombre *</label>
            <input id="nm-name" className={campo} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiqueta} htmlFor="nm-cat">Categoría</label>
              <select id="nm-cat" className={campo} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={etiqueta} htmlFor="nm-battery">Batería</label>
              <input id="nm-battery" className={campo} value={battery} onChange={(e) => setBattery(e.target.value)} placeholder="Grafeno" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiqueta} htmlFor="nm-price">Precio</label>
              <input id="nm-price" type="number" min={0} step={1000} className={campo} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Sin precio → “Precio por WhatsApp”" />
            </div>
            <div>
              <label className={etiqueta} htmlFor="nm-old">Precio anterior</label>
              <input id="nm-old" type="number" min={0} step={1000} className={campo} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={etiqueta} htmlFor="nm-range">Autonomía (km)</label>
              <input id="nm-range" type="number" min={0} className={campo} value={range} onChange={(e) => setRange(e.target.value)} />
            </div>
            <div>
              <label className={etiqueta} htmlFor="nm-speed">Velocidad (km/h)</label>
              <input id="nm-speed" type="number" min={0} className={campo} value={speed} onChange={(e) => setSpeed(e.target.value)} />
            </div>
            <div>
              <label className={etiqueta} htmlFor="nm-power">Motor (W)</label>
              <input id="nm-power" type="number" min={0} className={campo} value={power} onChange={(e) => setPower(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={etiqueta} htmlFor="nm-capacity">Capacidad de carga</label>
              <input id="nm-capacity" className={campo} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="2 personas / 180 kg" />
            </div>
            <div>
              <label className={etiqueta} htmlFor="nm-brakes">Frenos</label>
              <input id="nm-brakes" className={campo} value={brakes} onChange={(e) => setBrakes(e.target.value)} placeholder="Delantero y trasero, disco" />
            </div>
          </div>

          <div>
            <label className={etiqueta} htmlFor="nm-desc">Descripción</label>
            <textarea id="nm-desc" rows={3} className={campo.replace('h-11', 'py-2.5')} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="h-4 w-4" />
              Oferta activa
            </label>
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
              Publicado
            </label>
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={matricula} onChange={(e) => setMatricula(e.target.checked)} className="h-4 w-4" />
              Con matrícula
            </label>
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={soat} onChange={(e) => setSoat(e.target.checked)} className="h-4 w-4" />
              Exige SOAT
            </label>
            <label className="flex min-h-[36px] items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" checked={tecnomecanica} onChange={(e) => setTecnomecanica(e.target.checked)} className="h-4 w-4" />
              Exige tecnomecánica
            </label>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red-deep">
              {error}
            </p>
          )}

          {moto && !confirmarEliminar && (
            <button
              type="button"
              onClick={() => setConfirmarEliminar(true)}
              className="text-[12.5px] font-semibold text-red hover:underline"
            >
              Eliminar este producto
            </button>
          )}
          {moto && confirmarEliminar && (
            <div className="rounded-lg border border-red/30 bg-red/10 p-3">
              <p className="text-[13px] text-ink">¿Eliminar «{moto.name}» de verdad? No se puede deshacer.</p>
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
            {guardando ? 'Guardando…' : moto ? 'Guardar' : 'Crear moto'}
          </button>
        </div>
      </div>
    </div>
  )
}

type FilaCustom = {
  id: string
  name: string
  category: string
  price: number | null
  old_price: number | null
  on_sale: boolean
  published: boolean
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
  updated_at: string
}

const custaMotoAAdmin = (f: FilaCustom): MotoAdmin => ({
  id: f.id,
  name: f.name,
  category: f.category,
  image: f.image,
  range: f.range,
  speed: f.speed,
  power: f.power,
  price: f.price,
  oldPrice: f.old_price,
  onSale: f.on_sale,
  published: f.published,
  updatedAt: f.updated_at,
  custom: true,
  battery: f.battery,
  capacity: f.capacity,
  brakes: f.brakes,
  description: f.description,
  soat: f.soat,
  matricula: f.matricula,
  tecnomecanica: f.tecnomecanica,
})

export default function MotosList() {
  const [motos, setMotos] = useState<MotoAdmin[] | null>(null)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<MotoAdmin | null>(null)
  /** undefined = cerrado; null = creando una nueva; MotoAdmin = editando una ya creada */
  const [editandoCustom, setEditandoCustom] = useState<MotoAdmin | null | undefined>(undefined)
  const [aviso, setAviso] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    setError('')
    Promise.all([
      fetch('/api/admin/motos').then((r) => r.json()),
      fetch('/api/admin/custom-motos').then((r) => r.json()),
    ])
      .then(([catalogo, custom]) => {
        if (!catalogo.ok) return setError('No se pudieron cargar las motos.')
        const nuevas = custom.ok ? (custom.motos as FilaCustom[]).map(custaMotoAAdmin) : []
        setMotos([...nuevas, ...catalogo.motos])
      })
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

  const guardarCustom = (m: MotoAdmin, eliminada?: boolean) => {
    setMotos((prev) => {
      if (!prev) return prev
      if (eliminada) return prev.filter((x) => x.id !== m.id)
      const existe = prev.some((x) => x.id === m.id)
      return existe ? prev.map((x) => (x.id === m.id ? m : x)) : [m, ...prev]
    })
    setEditandoCustom(undefined)
    setAviso(eliminada ? 'Producto eliminado.' : 'Cambios guardados.')
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
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre…"
            className="h-11 w-full max-w-xs rounded-lg border border-ink/15 bg-white px-3.5 text-[14px] outline-none focus-visible:border-blue"
          />
          <button
            type="button"
            onClick={() => setEditandoCustom(null)}
            className="min-h-[44px] shrink-0 rounded-full bg-blue px-5 text-[12px] font-bold uppercase tracking-widest2 text-white"
          >
            + Nueva moto
          </button>
        </div>
      </div>

      {aviso && <p className="mt-4 rounded-lg bg-blue/10 px-3.5 py-2 text-[13px] text-blue-deep">{aviso}</p>}
      {error && <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2 text-[13px] text-red-deep">{error}</p>}

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
                  {urlDeImagen(m.image) && (
                    <img
                      src={urlDeImagen(m.image)!}
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
                  {m.custom && (
                    <span className="rounded-md bg-blue/15 px-2 py-1 text-[10.5px] font-bold uppercase text-blue-deep">Creada</span>
                  )}
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
                  onClick={() => (m.custom ? setEditandoCustom(m) : setEditando(m))}
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
      {editandoCustom !== undefined && (
        <CrearEditarModal moto={editandoCustom} onCerrar={() => setEditandoCustom(undefined)} onGuardado={guardarCustom} />
      )}
    </div>
  )
}
