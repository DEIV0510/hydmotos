import { useEffect, useState } from 'react'
import type { MotoAdmin } from './MotosList'
import type { RepuestoAdmin } from './RepuestosList'

/** Lo único que el resumen necesita de cada producto */
type Contable = { published: boolean; onSale: boolean }
/** Filas de custom_motos / custom_repuestos, tal como las devuelve la API */
type FilaCustom = { published: boolean; on_sale: boolean }
type FilaVehiculo = { tipo: string; published: boolean }

type Datos = { motos: Contable[]; repuestos: Contable[]; vehiculos: FilaVehiculo[] }

/** Lee una lista del panel; si falla, el Error ya trae el mensaje para mostrar */
async function pedir<T>(url: string, clave: string): Promise<T[]> {
  let r: Response
  try {
    r = await fetch(url)
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }
  const d = await r.json().catch(() => null)
  if (!r.ok || !d?.ok) throw new Error(d?.error || 'No se pudieron cargar las cifras.')
  return d[clave] as T[]
}

const desdeCustom = (f: FilaCustom): Contable => ({ published: f.published, onSale: f.on_sale })

function Tarjetas({ cifras }: { cifras: { l: string; v: number }[] | null }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
  )
}

export default function Dashboard() {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState('')

  // Todo o nada: si falla una lista se avisa, en vez de mostrar ceros que no
  // son reales (el catálogo creado desde el panel también cuenta)
  const cargar = () => {
    setError('')
    setDatos(null)
    Promise.all([
      pedir<MotoAdmin>('/api/admin/motos', 'motos'),
      pedir<FilaCustom>('/api/admin/custom-motos', 'motos'),
      pedir<RepuestoAdmin>('/api/admin/repuestos', 'repuestos'),
      pedir<FilaCustom>('/api/admin/custom-repuestos', 'repuestos'),
      pedir<FilaVehiculo>('/api/admin/vehiculos', 'vehiculos'),
    ])
      .then(([motos, motosNuevas, repuestos, repuestosNuevos, vehiculos]) =>
        setDatos({
          motos: [...motos, ...motosNuevas.map(desdeCustom)],
          repuestos: [...repuestos, ...repuestosNuevos.map(desdeCustom)],
          vehiculos,
        }),
      )
      .catch((e: Error) => setError(e.message))
  }

  useEffect(cargar, [])

  const resumen = (lista: Contable[], total: string, publicados: string, ocultos: string) => [
    { l: total, v: lista.length },
    { l: publicados, v: lista.filter((p) => p.published).length },
    { l: ocultos, v: lista.filter((p) => !p.published).length },
    { l: 'Con oferta activa', v: lista.filter((p) => p.onSale).length },
  ]

  const cifrasMotos = datos && resumen(datos.motos, 'Motos en el catálogo', 'Publicadas', 'Ocultas')
  const cifrasRepuestos =
    datos && resumen(datos.repuestos, 'Repuestos en el catálogo', 'Publicados', 'Ocultos')
  const cifrasVehiculos = datos && [
    { l: 'Patinetas', v: datos.vehiculos.filter((v) => v.tipo === 'patineta').length },
    { l: 'Carros', v: datos.vehiculos.filter((v) => v.tipo === 'carro').length },
    { l: 'Publicados', v: datos.vehiculos.filter((v) => v.published).length },
    { l: 'Ocultos', v: datos.vehiculos.filter((v) => !v.published).length },
  ]

  return (
    <div>
      <h1 className="font-display text-[1.8rem] font-extrabold uppercase text-ink">Dashboard</h1>
      <p className="mt-1 text-[13.5px] text-slate">Resumen del catálogo.</p>

      {error ? (
        <div
          role="alert"
          className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2.5 text-[13px] text-red-deep"
        >
          <span>{error}</span>
          <button type="button" onClick={cargar} className="min-h-[36px] font-semibold underline underline-offset-2">
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">Motos</h2>
          <Tarjetas cifras={cifrasMotos} />

          <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">Repuestos</h2>
          <Tarjetas cifras={cifrasRepuestos} />

          <h2 className="mt-7 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">
            Patinetas y carros
          </h2>
          <Tarjetas cifras={cifrasVehiculos} />
        </>
      )}

      <p className="mt-8 text-[12.5px] text-slate">
        En <span className="font-semibold text-ink">Motos</span> y{' '}
        <span className="font-semibold text-ink">Repuestos</span> se editan precio, oferta, publicado/oculto e
        imagen del catálogo, y con «+ Nueva» se agregan productos nuevos.{' '}
        <span className="font-semibold text-ink">Patinetas</span> y{' '}
        <span className="font-semibold text-ink">Carros</span> se cargan completos, con sus fotos. En{' '}
        <span className="font-semibold text-ink">Contenido</span> van el Hero, contacto, WhatsApp, SEO, menú y
        los videos del local y de Descuentos.
      </p>
    </div>
  )
}
