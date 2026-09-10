import MotoArt from '@/components/art/MotoArt'
import { useTilt } from '@/hooks/useTilt'
import { formatCOP, photoOf, type Moto } from '@/data/motos'
import { IconBattery, IconGauge, IconRoute, IconArrow } from '@/components/art/Icons'
import { waLink, waForMoto } from '@/lib/wa'

export default function MotoCard({
  moto,
  onOpen,
  priority = false,
}: {
  moto: Moto
  onOpen: (m: Moto) => void
  /** Las primeras tarjetas cargan su foto de inmediato, el resto en diferido */
  priority?: boolean
}) {
  const tilt = useTilt<HTMLElement>(5)
  const off = moto.oldPrice && moto.price
    ? Math.round(((moto.oldPrice - moto.price) / moto.oldPrice) * 100)
    : 0
  const wa = waLink(waForMoto(moto.name))
  const photo = photoOf(moto)

  const specs = [
    moto.range && { Icon: IconRoute, v: `${moto.range} km`, l: 'Autonomía' },
    moto.speed && { Icon: IconGauge, v: `${moto.speed} km/h`, l: 'Velocidad' },
    moto.power && { Icon: IconBattery, v: `${moto.power}W`, l: 'Motor' },
  ].filter(Boolean) as { Icon: typeof IconRoute; v: string; l: string }[]

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-card shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-blue/25 hover:shadow-card-hover focus-within:border-blue/40 [transform-style:preserve-3d] [transform:perspective(1100px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))_translateZ(0)]"
    >
      {/* Escenario del vehículo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-paper2/70">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-light bg-grid opacity-30" />
          <div className="absolute left-1/2 top-[58%] h-36 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/[0.13] blur-[46px] transition-all duration-700 group-hover:bg-blue/10" />
        </div>

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
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              className={`h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07] ${
                moto.photoFit === 'cover' ? 'object-cover' : 'object-contain'
              }`}
            />
          ) : (
            <MotoArt
              variant={moto.art}
              tone="light"
              weight={7}
              className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
              title={`Ilustración de ${moto.name}`}
            />
          )}
        </div>
      </div>

      {/* Datos */}
      <div className="relative flex flex-1 flex-col p-3 [transform:translateZ(18px)] sm:p-5">
        <h3 className="font-display text-[1.05rem] font-bold uppercase leading-none text-ink sm:text-[1.3rem]">
          {moto.name}
        </h3>

        {moto.colors && moto.colors.length > 0 && (
          <p className="mt-1.5 truncate text-[11px] text-slate" title={moto.colors.join(', ')}>
            {moto.colors.length} {moto.colors.length === 1 ? 'color' : 'colores'} · {moto.colors.slice(0, 2).join(', ')}
            {moto.colors.length > 2 && '…'}
          </p>
        )}

        {specs.length > 0 && (
          <ul className="mt-2.5 grid grid-cols-3 gap-1 border-y border-ink/[0.08] py-2.5 sm:gap-1.5">
            {specs.map(({ Icon, v, l }) => (
              <li key={l} className="flex items-center gap-1 sm:gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-blue sm:h-4 sm:w-4" />
                <span className="min-w-0">
                  <span className="block font-display text-[11px] font-bold leading-none text-ink sm:text-[14px]">{v}</span>
                  <span className="mt-0.5 hidden truncate text-[9px] font-semibold uppercase tracking-wider text-slate sm:block">
                    {l}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {moto.price ? (
              <>
                {moto.oldPrice && (
                  <p className="text-[10.5px] font-medium text-slate line-through sm:text-[12px]">{formatCOP(moto.oldPrice)}</p>
                )}
                <p className="font-display text-[clamp(1rem,4.2vw,1.45rem)] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
                  {formatCOP(moto.price)}
                </p>
              </>
            ) : (
              <p className="font-display text-[12px] font-bold uppercase leading-tight tracking-wide text-blue-deep sm:text-[15px]">
                Precio por
                <br />
                WhatsApp
              </p>
            )}
          </div>
          <span className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-widest2 text-slate transition-colors group-hover:text-blue-deep sm:inline-flex">
            Detalles
            <IconArrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>

        <a
          href={wa}
          target={wa.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="relative z-20 mt-3 inline-flex min-h-[46px] items-center justify-center rounded-full bg-ink text-[11.5px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-red-btn hover:shadow-glow-red active:scale-[0.98]"
        >
          Cotizar
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
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      />
    </article>
  )
}
