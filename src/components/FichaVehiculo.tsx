import { useState } from 'react'
import PhotoPending from '@/components/art/PhotoPending'
import { IconWhatsApp } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { waForVehiculo, type Vehiculo } from '@/lib/vehiculos-live'
import { useWa } from '@/lib/wa'

const TONOS = {
  oscuro: {
    tarjeta: 'rounded-3xl border border-cyan/20 bg-graphite shadow-lift',
    foto: 'bg-graphite',
    separador: 'border-white/[0.07]',
    mini: 'bg-void',
    miniActiva: 'border-cyan',
    miniResto: 'border-white/10 hover:border-white/35',
    detalle: 'text-cyan',
    nombre: 'text-chrome',
    secundario: 'text-silver',
    precio: 'text-chrome',
  },
  claro: {
    tarjeta: 'rounded-2xl border border-ink/[0.07] bg-card shadow-card',
    foto: 'bg-white',
    separador: 'border-ink/[0.07]',
    mini: 'bg-paper2',
    miniActiva: 'border-blue',
    miniResto: 'border-ink/10 hover:border-ink/30',
    detalle: 'text-blue-deep',
    nombre: 'text-ink',
    secundario: 'text-slate',
    precio: 'text-ink',
  },
} as const

/**
 * Ficha de un carro o una patineta: galería con miniaturas, nombre, precio (o
 * "Precio por WhatsApp" si el admin no lo puso) y botón de compra. Las fotos
 * van enteras (object-contain), sin recorte, como pidió el cliente.
 */
export default function FichaVehiculo({ v, tono }: { v: Vehiculo; tono: keyof typeof TONOS }) {
  const t = TONOS[tono]
  const { waLink, waReady } = useWa()
  const [activa, setActiva] = useState(0)
  const foto = v.images[Math.min(activa, v.images.length - 1)]
  const wa = waLink(waForVehiculo(v))
  const off = v.price && v.oldPrice ? Math.round(((v.oldPrice - v.price) / v.oldPrice) * 100) : 0
  const datos = [v.range && `${v.range} km autonomía`, v.speed && `${v.speed} km/h`].filter(Boolean) as string[]

  return (
    <article className={`flex h-full flex-col overflow-hidden ${t.tarjeta}`}>
      <div className={`relative aspect-[4/3] ${t.foto}`}>
        {off > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-red-btn px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-white">
            −{off}%
          </span>
        )}
        {foto ? (
          <img
            key={foto.src}
            src={foto.src}
            srcSet={foto.srcSet}
            sizes="(min-width: 1024px) 620px, 92vw"
            alt={foto.alt || v.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full animate-[fade_.35s_ease-out_both] object-contain"
          />
        ) : (
          <PhotoPending name={v.name} />
        )}
      </div>

      {v.images.length > 1 && (
        <ul className={`grid grid-cols-4 gap-2 border-t p-3 ${t.separador}`} aria-label={`Fotos de ${v.name}`}>
          {v.images.map((f, i) => (
            <li key={f.src}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                aria-label={`Ver foto ${i + 1} de ${v.images.length}`}
                aria-pressed={i === activa}
                className={`block aspect-[4/3] w-full overflow-hidden rounded-lg border transition-colors duration-300 ${t.mini} ${
                  i === activa ? t.miniActiva : t.miniResto
                }`}
              >
                <img
                  src={f.src}
                  srcSet={f.srcSet}
                  sizes="140px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {v.detail && (
          <p className={`text-[10.5px] font-semibold uppercase tracking-widest2 ${t.detalle}`}>{v.detail}</p>
        )}
        <h3
          className={`mt-1.5 font-display text-[1.7rem] font-extrabold uppercase leading-none sm:text-[2rem] ${t.nombre}`}
        >
          {v.name}
        </h3>
        {datos.length > 0 && <p className={`mt-2 text-[12.5px] ${t.secundario}`}>{datos.join(' · ')}</p>}
        {v.description && (
          <p className={`mt-3 line-clamp-3 text-[13.5px] leading-relaxed ${t.secundario}`}>{v.description}</p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          {v.price ? (
            <div>
              {v.oldPrice && <p className={`text-[12px] line-through ${t.secundario}`}>{formatCOP(v.oldPrice)}</p>}
              <p
                className={`font-display text-[1.6rem] font-extrabold leading-none tracking-tight [font-variant-numeric:tabular-nums] ${t.precio}`}
              >
                {formatCOP(v.price)}
              </p>
            </div>
          ) : (
            <p className={`font-display text-[1.05rem] font-bold uppercase leading-tight tracking-wide ${t.secundario}`}>
              Precio por
              <br />
              WhatsApp
            </p>
          )}
          <a
            href={wa}
            target={waReady ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-blue px-7 text-[12.5px] font-bold uppercase tracking-widest2 text-white shadow-glow-blue transition-colors duration-300 hover:bg-blue-deep"
          >
            <IconWhatsApp className="h-4 w-4" />
            Comprar
          </a>
        </div>
      </div>
    </article>
  )
}
