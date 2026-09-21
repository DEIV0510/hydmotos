import PhotoPending from '@/components/art/PhotoPending'
import { useTilt } from '@/hooks/useTilt'
import { formatCOP } from '@/data/motos'
import { photoOfLive, type MotoConEstado } from '@/lib/motos-live'
import { waLink, waForMoto } from '@/lib/wa'
import { prioridad } from '@/lib/img'

export default function MotoCard({
  moto,
  onOpen,
  priority = false,
}: {
  moto: MotoConEstado
  onOpen: (m: MotoConEstado) => void
  /** Las primeras tarjetas cargan su foto de inmediato, el resto en diferido */
  priority?: boolean
}) {
  const tilt = useTilt<HTMLElement>(5)
  const off = moto.oldPrice && moto.price
    ? Math.round(((moto.oldPrice - moto.price) / moto.oldPrice) * 100)
    : 0
  const wa = waLink(waForMoto(moto.name))
  const photo = photoOfLive(moto)

  // Solo lo que ayuda a decidir de un vistazo: autonomía y velocidad. El resto
  // de la ficha (motor, frenos, batería...) va en el detalle del producto.
  const datos = [moto.range && `${moto.range} km autonomía`, moto.speed && `${moto.speed} km/h`].filter(
    Boolean,
  ) as string[]

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-ink/[0.07] bg-card shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-blue/25 hover:shadow-card-hover focus-within:border-blue/40 [transform-style:preserve-3d] [transform:perspective(1100px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))_translateZ(0)]"
    >
      {/* Escenario del vehículo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-paper2/70">
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-md bg-red-btn px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-white">
              −{off}%
            </span>
          )}
          {moto.matricula && (
            <span className="rounded-md border border-blue/25 bg-card/85 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep backdrop-blur">
              Con matrícula
            </span>
          )}
        </div>

        <div
          className={`relative flex h-full items-center justify-center [transform:translateZ(30px)] ${
            moto.photoFit === 'cover' ? '' : 'p-3'
          }`}
        >
          {photo ? (
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(max-width: 640px) 92vw, (max-width: 1280px) 44vw, 300px"
              alt={`Moto eléctrica ${moto.name}`}
              width={450}
              height={450}
              loading={priority ? 'eager' : 'lazy'}
              {...prioridad(priority ? 'high' : 'auto')}
              decoding="async"
              className={`h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07] ${
                moto.photoFit === 'cover' ? 'object-cover' : 'object-contain'
              }`}
            />
          ) : (
            <PhotoPending name={moto.name} />
          )}
        </div>
      </div>

      {/* Datos */}
      <div className="relative flex flex-1 flex-col p-3 [transform:translateZ(18px)] sm:p-5">
        <h3 className="font-display text-[1.05rem] font-bold uppercase leading-none text-ink sm:text-[1.3rem]">
          {moto.name}
        </h3>

        {moto.price ? (
          <>
            {moto.oldPrice && (
              <p className="mt-2 text-[11px] font-medium text-slate line-through sm:text-[12px]">{formatCOP(moto.oldPrice)}</p>
            )}
            <p className={`font-display text-[clamp(1rem,4.2vw,1.45rem)] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] ${moto.oldPrice ? 'mt-0.5' : 'mt-2'}`}>
              {formatCOP(moto.price)}
            </p>
          </>
        ) : (
          <p className="mt-2 font-display text-[12px] font-bold uppercase leading-tight tracking-wide text-blue-deep sm:text-[15px]">
            Precio por WhatsApp
          </p>
        )}

        {datos.length > 0 && (
          <p className="mt-1.5 text-[12px] text-slate sm:text-[12.5px]">{datos.join(' · ')}</p>
        )}

        <a
          href={wa}
          target={wa.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="relative z-20 mt-3 inline-flex min-h-[46px] items-center justify-center rounded-md bg-blue text-[11.5px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-blue-deep hover:shadow-glow-blue active:scale-[0.98]"
        >
          Comprar
        </a>
      </div>

      {/*
        Toda la tarjeta abre la ficha: en dos columnas no cabe un botón
        "Detalles" aparte, y es el gesto que se espera en un catálogo.
        Queda por debajo del CTA de WhatsApp (z-20) para no robarle el toque.
      */}
      <button
        type="button"
        onClick={() => onOpen(moto)}
        aria-label={`Ver detalles de ${moto.name}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      />
    </article>
  )
}
