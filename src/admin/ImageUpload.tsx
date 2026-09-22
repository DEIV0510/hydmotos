import { useRef, useState } from 'react'

const TIPOS_VALIDOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 3 * 1024 * 1024

function leerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result as string)
    lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    lector.readAsDataURL(file)
  })
}

/**
 * Subida de imagen reutilizable (motos y repuestos): valida tipo/tamaño,
 * muestra una vista previa antes y durante la subida, y llama a `onSubido`
 * con la URL final de Vercel Blob. El campo de precio/oferta/publicado sigue
 * su propio flujo de guardado; esto solo resuelve "cambiar la foto".
 */
export default function ImageUpload({
  carpeta,
  id,
  valorActual,
  onSubido,
}: {
  carpeta: 'motos' | 'repuestos' | 'contenido'
  id: string
  valorActual: string | null
  onSubido: (url: string) => void
}) {
  const [previa, setPrevia] = useState<string | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const elegir = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir el mismo archivo si falla
    if (!file) return

    setError('')
    if (!TIPOS_VALIDOS.includes(file.type)) {
      setError('La imagen debe ser JPG, PNG o WEBP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('La imagen pesa demasiado. Máximo 3 MB.')
      return
    }

    try {
      const dataUrl = await leerComoDataUrl(file)
      setPrevia(dataUrl)
      setSubiendo(true)
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, folder: carpeta, id }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudo subir la imagen. Intenta nuevamente.')
        setPrevia(null)
        return
      }
      onSubido(d.url)
    } catch {
      setError('No se pudo subir la imagen. Intenta nuevamente.')
      setPrevia(null)
    } finally {
      setSubiendo(false)
    }
  }

  const mostrar = previa ?? valorActual

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink/15 bg-paper2">
          {mostrar ? (
            <img src={mostrar} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-slate">Sin foto</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={elegir}
            disabled={subiendo}
            className="min-h-[40px] rounded-full border border-ink/15 px-4 text-[12px] font-bold uppercase tracking-widest2 text-ink hover:border-blue/40 hover:text-blue-deep disabled:opacity-60"
          >
            {subiendo ? 'Subiendo…' : 'Cambiar imagen'}
          </button>
          <p className="mt-1 text-[11px] text-slate">JPG, PNG o WEBP · máximo 3 MB</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFile}
        className="sr-only"
        aria-label="Elegir imagen"
      />
      {error && (
        <p role="alert" className="mt-2 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
          {error}
        </p>
      )}
    </div>
  )
}
