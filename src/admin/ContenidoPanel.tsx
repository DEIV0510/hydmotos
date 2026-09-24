import { useEffect, useRef, useState } from 'react'
import ImageUpload, { subirDataUrl } from './ImageUpload'
import type {
  ContactSettings,
  HeroSettings,
  NavItem,
  SeoSettings,
  SocialSettings,
  VideoSettings,
  VideosSettings,
  WhatsappSettings,
} from '@/lib/settings-live'

type Settings = {
  hero: HeroSettings
  contact: ContactSettings
  whatsapp: WhatsappSettings
  seo: SeoSettings
  social: SocialSettings
  nav: { items: NavItem[] }
  videos: VideosSettings
}

const TABS = [
  { id: 'hero', label: 'Hero' },
  { id: 'contact', label: 'Contacto' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'seo', label: 'SEO' },
  { id: 'social', label: 'Redes' },
  { id: 'nav', label: 'Menú' },
  { id: 'videos', label: 'Videos' },
] as const
type TabId = (typeof TABS)[number]['id']

const campo =
  'h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-[14px] outline-none focus-visible:border-blue'
const areaCampo =
  'w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[14px] outline-none focus-visible:border-blue'
const etiqueta = 'mb-1 block text-[12.5px] font-medium text-slate'

function Guardar({ guardando, onClick }: { guardando: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={guardando}
      className="mt-2 min-h-[46px] rounded-full bg-blue px-7 text-[13px] font-bold uppercase tracking-widest2 text-white disabled:opacity-60"
    >
      {guardando ? 'Guardando…' : 'Guardar cambios'}
    </button>
  )
}

function AvisoError({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null
  return (
    <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
      {mensaje}
    </p>
  )
}

/** Cada pestaña guarda solo su propia sección: si falla una, las demás no se ven afectadas. */
function useGuardarSeccion(key: keyof Settings, onGuardado: (key: keyof Settings, value: unknown) => void) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const guardar = async (value: unknown) => {
    setError('')
    setGuardando(true)
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudieron guardar los cambios.')
        return false
      }
      onGuardado(key, value)
      return true
    } catch {
      setError('No se pudo conectar con el servidor.')
      return false
    } finally {
      setGuardando(false)
    }
  }

  return { guardar, guardando, error }
}

function HeroTab({ value, onGuardado }: { value: HeroSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, guardando, error } = useGuardarSeccion('hero', onGuardado)
  useEffect(() => setV(value), [value])

  return (
    <div className="space-y-4">
      <div>
        <p className={etiqueta}>Imagen de portada (respaldo antes de que cargue el vídeo)</p>
        <ImageUpload carpeta="contenido" id="hero-poster" valorActual={v.poster} onSubido={(url) => setV({ ...v, poster: url })} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="h-kicker">Frase pequeña (junto al nombre de la marca)</label>
        <input id="h-kicker" className={campo} value={v.kicker} onChange={(e) => setV({ ...v, kicker: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="h-t1">Título — línea 1</label>
          <input id="h-t1" className={campo} value={v.title1} onChange={(e) => setV({ ...v, title1: e.target.value })} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="h-t2">Título — línea 2</label>
          <input id="h-t2" className={campo} value={v.title2} onChange={(e) => setV({ ...v, title2: e.target.value })} />
          <p className="mt-1 text-[11px] text-slate">El punto final rojo se agrega solo, no hace falta escribirlo.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="h-cta">Texto del botón</label>
          <input id="h-cta" className={campo} value={v.ctaLabel} onChange={(e) => setV({ ...v, ctaLabel: e.target.value })} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="h-href">Enlace del botón</label>
          <input id="h-href" className={campo} value={v.ctaHref} onChange={(e) => setV({ ...v, ctaHref: e.target.value })} />
          <p className="mt-1 text-[11px] text-slate">Ej. #motos para ir a una sección de esta página.</p>
        </div>
      </div>
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar(v)} />
    </div>
  )
}

function ContactTab({ value, onGuardado }: { value: ContactSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, guardando, error } = useGuardarSeccion('contact', onGuardado)
  useEffect(() => setV(value), [value])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="c-wa">Número de WhatsApp</label>
          <input
            id="c-wa"
            className={campo}
            value={v.whatsapp}
            onChange={(e) => setV({ ...v, whatsapp: e.target.value.replace(/[^\d]/g, '') })}
            placeholder="573001234567"
          />
          <p className="mt-1 text-[11px] text-slate">Solo números, con el indicativo de país (57 = Colombia).</p>
        </div>
        <div>
          <label className={etiqueta} htmlFor="c-phone">Teléfono visible</label>
          <input id="c-phone" className={campo} value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="310 206 3400" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="c-email">Correo</label>
          <input id="c-email" type="email" className={campo} value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="c-schedule">Horario</label>
          <input id="c-schedule" className={campo} value={v.schedule} onChange={(e) => setV({ ...v, schedule: e.target.value })} placeholder="Vacío = no se muestra" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="c-address">Dirección</label>
          <input id="c-address" className={campo} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="c-city">Ciudad</label>
          <input id="c-city" className={campo} value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={etiqueta} htmlFor="c-maps">Enlace de Google Maps</label>
        <input id="c-maps" className={campo} value={v.mapsUrl} onChange={(e) => setV({ ...v, mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
        <p className="mt-1 text-[11px] text-slate">Si lo llenas, la dirección en la web se vuelve un enlace a Maps.</p>
      </div>
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar(v)} />
    </div>
  )
}

function WhatsappTab({ value, onGuardado }: { value: WhatsappSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, guardando, error } = useGuardarSeccion('whatsapp', onGuardado)
  useEffect(() => setV(value), [value])

  const previa = v.productMessageTemplate.replace(/\{PRODUCT_NAME\}/g, 'APOLO').replace(/\{PRICE\}/g, '$7.000.000')

  return (
    <div className="space-y-4">
      <div>
        <label className={etiqueta} htmlFor="w-general">Mensaje general (botón flotante, navegación, contacto)</label>
        <textarea id="w-general" rows={3} className={areaCampo} value={v.generalMessage} onChange={(e) => setV({ ...v, generalMessage: e.target.value })} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="w-product">Mensaje al comprar una moto</label>
        <textarea id="w-product" rows={3} className={areaCampo} value={v.productMessageTemplate} onChange={(e) => setV({ ...v, productMessageTemplate: e.target.value })} />
        <p className="mt-1 text-[11px] text-slate">
          Usa <code className="rounded bg-paper2 px-1">{'{PRODUCT_NAME}'}</code> y{' '}
          <code className="rounded bg-paper2 px-1">{'{PRICE}'}</code> — se reemplazan solos por el nombre y el
          precio de cada moto.
        </p>
        <p className="mt-2 rounded-lg bg-paper2 px-3 py-2 text-[12.5px] text-ink">
          <span className="font-semibold text-slate">Vista previa: </span>
          {previa}
        </p>
      </div>
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar(v)} />
    </div>
  )
}

function SeoTab({ value, onGuardado }: { value: SeoSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, guardando, error } = useGuardarSeccion('seo', onGuardado)
  useEffect(() => setV(value), [value])

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-blue/20 bg-blue/5 px-3.5 py-2.5 text-[12.5px] text-blue-deep">
        Esto cambia el título de la pestaña y lo que Google indexa. Las vistas previas de WhatsApp y Facebook
        (imagen y texto al pegar el enlace) solo cambian cuando se publica una actualización del sitio, no al
        instante.
      </p>
      <div>
        <label className={etiqueta} htmlFor="s-title">Título SEO ({v.metaTitle.length}/70)</label>
        <input id="s-title" className={campo} maxLength={70} value={v.metaTitle} onChange={(e) => setV({ ...v, metaTitle: e.target.value })} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="s-desc">Descripción SEO ({v.metaDescription.length}/200)</label>
        <textarea id="s-desc" rows={3} maxLength={200} className={areaCampo} value={v.metaDescription} onChange={(e) => setV({ ...v, metaDescription: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={etiqueta} htmlFor="s-ogtitle">Título Open Graph</label>
          <input id="s-ogtitle" className={campo} value={v.ogTitle} onChange={(e) => setV({ ...v, ogTitle: e.target.value })} />
        </div>
        <div>
          <label className={etiqueta} htmlFor="s-ogimage">Imagen Open Graph (URL)</label>
          <input id="s-ogimage" className={campo} value={v.ogImage} onChange={(e) => setV({ ...v, ogImage: e.target.value })} />
        </div>
      </div>
      <div>
        <label className={etiqueta} htmlFor="s-ogdesc">Descripción Open Graph</label>
        <textarea id="s-ogdesc" rows={2} className={areaCampo} value={v.ogDescription} onChange={(e) => setV({ ...v, ogDescription: e.target.value })} />
      </div>
      <div>
        <label className={etiqueta} htmlFor="s-canonical">URL canónica</label>
        <input id="s-canonical" className={campo} value={v.canonical} onChange={(e) => setV({ ...v, canonical: e.target.value })} />
      </div>
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar(v)} />
    </div>
  )
}

function SocialTab({ value, onGuardado }: { value: SocialSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, guardando, error } = useGuardarSeccion('social', onGuardado)
  useEffect(() => setV(value), [value])

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-slate">Vacío = no se muestra ese ícono en la web.</p>
      {(['instagram', 'facebook', 'tiktok', 'youtube'] as const).map((red) => (
        <div key={red}>
          <label className={etiqueta} htmlFor={`soc-${red}`}>
            {red[0].toUpperCase() + red.slice(1)}
          </label>
          <input id={`soc-${red}`} className={campo} value={v[red]} onChange={(e) => setV({ ...v, [red]: e.target.value })} placeholder="https://…" />
        </div>
      ))}
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar(v)} />
    </div>
  )
}

function NavTab({ value, onGuardado }: { value: { items: NavItem[] }; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [items, setItems] = useState(value.items)
  const { guardar, guardando, error } = useGuardarSeccion('nav', onGuardado)
  useEffect(() => setItems(value.items), [value])

  const actualizar = (i: number, cambios: Partial<NavItem>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...cambios } : it)))

  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const copia = [...items]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    setItems(copia.map((it, idx) => ({ ...it, order: idx })))
  }

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.id} className="rounded-lg border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">{it.id}</p>
            <div className="flex gap-1.5">
              <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="h-8 w-8 rounded-md border border-ink/15 text-ink disabled:opacity-30" aria-label={`Subir ${it.label}`}>
                ↑
              </button>
              <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} className="h-8 w-8 rounded-md border border-ink/15 text-ink disabled:opacity-30" aria-label={`Bajar ${it.label}`}>
                ↓
              </button>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={etiqueta} htmlFor={`nav-label-${it.id}`}>Nombre visible</label>
              <input id={`nav-label-${it.id}`} className={campo} value={it.label} onChange={(e) => actualizar(i, { label: e.target.value })} />
            </div>
            <div>
              <label className={etiqueta} htmlFor={`nav-href-${it.id}`}>Enlace</label>
              <input id={`nav-href-${it.id}`} className={campo} value={it.href} onChange={(e) => actualizar(i, { href: e.target.value })} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex min-h-[32px] items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={it.enabled} onChange={(e) => actualizar(i, { enabled: e.target.checked })} className="h-4 w-4" />
              Visible en el menú
            </label>
            <label className="flex min-h-[32px] items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={it.newTab} onChange={(e) => actualizar(i, { newTab: e.target.checked })} className="h-4 w-4" />
              Abrir en pestaña nueva
            </label>
          </div>
        </div>
      ))}
      <AvisoError mensaje={error} />
      <Guardar guardando={guardando} onClick={() => guardar({ items })} />
    </div>
  )
}

const TIPOS_VIDEO = ['video/mp4', 'video/webm']
const MAX_VIDEO_BYTES = 40 * 1024 * 1024 // el mismo tope que api/_handlers/admin/video-token.ts

/**
 * Abre el video en el navegador antes de subirlo: si no se puede reproducir
 * aquí, tampoco se vería en la web, así que se rechaza. De paso saca sus
 * medidas (para enmarcarlo entero en el sitio) y un fotograma como portada.
 */
async function leerVideo(file: File): Promise<{ ancho: number; alto: number; portada: string | null }> {
  const url = URL.createObjectURL(file)
  const v = document.createElement('video')
  v.muted = true
  v.playsInline = true
  v.preload = 'auto'
  v.src = url
  try {
    await new Promise<void>((listo, fallo) => {
      v.onloadeddata = () => listo()
      v.onerror = () =>
        fallo(new Error('Este video no se puede reproducir en el navegador, así que tampoco se vería en la web. Prueba con un MP4 (así los manda WhatsApp).'))
      setTimeout(() => fallo(new Error('No se pudo abrir el video. Prueba con un MP4.')), 20000)
    })
    const ancho = v.videoWidth
    const alto = v.videoHeight
    if (!ancho || !alto) throw new Error('No se pudo leer el tamaño del video.')

    // Portada: un fotograma cerca del principio (el primero suele venir negro)
    let portada: string | null = null
    try {
      v.currentTime = Math.min(1, (v.duration || 2) / 2)
      await new Promise<void>((listo) => {
        v.onseeked = () => listo()
        setTimeout(listo, 5000)
      })
      const escala = Math.min(1, 1280 / Math.max(ancho, alto))
      const c = document.createElement('canvas')
      c.width = Math.round(ancho * escala)
      c.height = Math.round(alto * escala)
      c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height)
      portada = c.toDataURL('image/jpeg', 0.82)
    } catch {
      portada = null // sin portada el video igual funciona
    }
    return { ancho, alto, portada }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function VideoSlot({
  titulo,
  ayuda,
  destino,
  actual,
  porDefecto,
  onCambio,
}: {
  titulo: string
  ayuda: string
  destino: 'showroom' | 'promo'
  actual: VideoSettings | null
  /** Lo que se ve sin video propio: el original del local, o nada */
  porDefecto: { src: string; poster: string } | null
  onCambio: (nuevo: VideoSettings | null) => Promise<boolean>
}) {
  const [estado, setEstado] = useState('')
  const [error, setError] = useState('')
  const [confirmarQuitar, setConfirmarQuitar] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const subir = async (file: File) => {
    setError('')
    if (!TIPOS_VIDEO.includes(file.type)) return setError('El video debe ser MP4 (así los manda WhatsApp) o WEBM.')
    if (file.size > MAX_VIDEO_BYTES) {
      return setError('El video pesa demasiado: máximo 40 MB. Uno de 30 segundos enviado por WhatsApp suele pesar menos de 15 MB.')
    }
    try {
      setEstado('Revisando el video…')
      const info = await leerVideo(file)

      setEstado('Preparando la subida…')
      const r = await fetch('/api/admin/video-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destino, tipo: file.type, tamano: file.size }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo preparar la subida del video.')

      // Directo del navegador a Blob: el video no pasa por la función de Vercel
      const { put } = await import('@vercel/blob/client')
      const blob = await put(d.pathname, file, {
        access: 'public',
        token: d.token,
        contentType: file.type,
        multipart: file.size > 8 * 1024 * 1024,
        onUploadProgress: (p) => setEstado(`Subiendo ${Math.round(p.percentage)} %…`),
      })

      let poster: string | null = null
      if (info.portada) {
        setEstado('Guardando la portada…')
        poster = await subirDataUrl(info.portada, 'contenido', `video-${destino}`).catch(() => null)
      }
      setEstado('Guardando…')
      const ok = await onCambio({ src: blob.url, poster, ancho: info.ancho, alto: info.alto })
      if (!ok) setError('El video se subió pero no se pudo guardar. Intenta nuevamente.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el video.')
    } finally {
      setEstado('')
    }
  }

  const quitar = async () => {
    setConfirmarQuitar(false)
    setEstado('Guardando…')
    await onCambio(null)
    setEstado('')
  }

  const mostrar = actual ? { src: actual.src, poster: actual.poster ?? undefined } : porDefecto

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5">
      <p className="font-semibold text-ink">{titulo}</p>
      <p className="mt-0.5 text-[12.5px] text-slate">{ayuda}</p>

      <div className="mt-4">
        {mostrar ? (
          <video
            key={mostrar.src}
            src={mostrar.src}
            poster={mostrar.poster}
            controls
            muted
            playsInline
            preload="metadata"
            className="max-h-72 max-w-full rounded-lg border border-ink/10 bg-ink"
          />
        ) : (
          <p className="rounded-lg border border-dashed border-ink/20 px-3 py-6 text-center text-[12.5px] text-slate">
            Sin video: el banner muestra solo las ofertas.
          </p>
        )}
        <p className="mt-1.5 text-[11.5px] text-slate">
          {actual
            ? `Video subido desde el panel · ${actual.ancho > actual.alto ? 'horizontal' : 'vertical'}`
            : porDefecto
              ? 'Video original del sitio'
              : ''}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={Boolean(estado)}
          className="min-h-[44px] rounded-full bg-blue px-5 text-[12px] font-bold uppercase tracking-widest2 text-white disabled:opacity-60"
        >
          {estado || (actual ? 'Cambiar video' : 'Subir video')}
        </button>
        {actual && !estado && !confirmarQuitar && (
          <button type="button" onClick={() => setConfirmarQuitar(true)} className="text-[12.5px] font-semibold text-red hover:underline">
            {porDefecto ? 'Volver al video original' : 'Quitar video'}
          </button>
        )}
      </div>
      {confirmarQuitar && (
        <div className="mt-3 rounded-lg border border-red/30 bg-red/10 p-3">
          <p className="text-[13px] text-ink">
            {porDefecto ? '¿Volver al video original del local?' : '¿Quitar el video del banner?'} El video subido se borra.
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={quitar} className="min-h-[38px] rounded-full bg-red px-4 text-[12px] font-bold uppercase tracking-widest2 text-white">
              Sí
            </button>
            <button type="button" onClick={() => setConfirmarQuitar(false)} className="min-h-[38px] rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink">
              Cancelar
            </button>
          </div>
        </div>
      )}
      <p className="mt-3 text-[11px] text-slate">MP4 o WEBM · máximo 40 MB · se ve entero, vertical u horizontal</p>
      <input
        ref={input}
        type="file"
        accept="video/mp4,video/webm"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) subir(file)
        }}
        className="sr-only"
        aria-label={`Elegir ${titulo.toLowerCase()}`}
      />
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
          {error}
        </p>
      )}
    </div>
  )
}

function VideosTab({ value, onGuardado }: { value: VideosSettings; onGuardado: (k: keyof Settings, v: unknown) => void }) {
  const [v, setV] = useState(value)
  const { guardar, error } = useGuardarSeccion('videos', onGuardado)
  useEffect(() => setV(value), [value])

  // Cada cambio se guarda al momento: subir el video ya es la acción
  const cambiar = (slot: keyof VideosSettings) => async (nuevo: VideoSettings | null) => {
    const siguiente = { ...v, [slot]: nuevo }
    const ok = await guardar(siguiente)
    if (ok) setV(siguiente)
    return ok
  }

  return (
    <div className="space-y-4">
      <VideoSlot
        titulo="Video del local"
        ayuda="Sección «Así es la tienda». Si no subes uno, se ve el recorrido original del local."
        destino="showroom"
        actual={v.showroom}
        porDefecto={{ src: '/video/showroom.mp4', poster: '/video/showroom-poster.jpg' }}
        onCambio={cambiar('showroom')}
      />
      <VideoSlot
        titulo="Video del banner de Descuentos"
        ayuda="Aparece junto a las ofertas, arriba en la página: sirve para una promoción del momento."
        destino="promo"
        actual={v.promo}
        porDefecto={null}
        onCambio={cambiar('promo')}
      />
      <AvisoError mensaje={error} />
    </div>
  )
}

export default function ContenidoPanel() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabId>('hero')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => (d.ok ? setSettings(d.settings) : setError('No se pudo cargar el contenido.')))
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }, [])

  const onGuardado = (key: keyof Settings, value: unknown) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
    // La API pública se cachea ~30 s: "ya se ve" haría pensar que falló al revisar al instante
    setAviso('Cambios guardados. En unos segundos se ven en la web.')
    setTimeout(() => setAviso(''), 3500)
  }

  return (
    <div>
      <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Contenido</h1>
      <p className="mt-1 text-[13.5px] text-slate">
        Hero, contacto, WhatsApp, SEO, menú y videos — se aplican a la web pública al guardar.
      </p>

      {aviso && <p className="mt-4 rounded-lg bg-blue/10 px-3.5 py-2 text-[13px] text-blue-deep">{aviso}</p>}
      {error && <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2 text-[13px] text-red">{error}</p>}

      {!settings && !error && (
        <div className="mt-6 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl border border-ink/10 bg-white" />
          ))}
        </div>
      )}

      {settings && (
        <>
          <div className="mt-6 flex flex-wrap gap-1.5 border-b border-ink/10" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`min-h-[44px] rounded-t-lg px-4 text-[12.5px] font-bold uppercase tracking-widest2 transition-colors ${
                  tab === t.id ? 'border-b-2 border-blue text-blue-deep' : 'text-slate hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6 max-w-2xl">
            <div hidden={tab !== 'hero'}>
              <HeroTab value={settings.hero} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'contact'}>
              <ContactTab value={settings.contact} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'whatsapp'}>
              <WhatsappTab value={settings.whatsapp} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'seo'}>
              <SeoTab value={settings.seo} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'social'}>
              <SocialTab value={settings.social} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'nav'}>
              <NavTab value={settings.nav} onGuardado={onGuardado} />
            </div>
            <div hidden={tab !== 'videos'}>
              <VideosTab value={settings.videos ?? { showroom: null, promo: null }} onGuardado={onGuardado} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
