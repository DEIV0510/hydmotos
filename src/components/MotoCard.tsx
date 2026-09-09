import MotoArt from '@/components/art/MotoArt'
import { useTilt } from '@/hooks/useTilt'
import { formatCOP, type Moto } from '@/data/motos'
import { IconBattery, IconGauge, IconRoute, IconArrow } from '@/components/art/Icons'
import { waLink, waForMoto } from '@/lib/wa'

export default function MotoCard({ moto, onOpen }: { moto: Moto; onOpen: (m: Moto) => void }) {
  const tilt = useTilt<HTMLElement>(5)
  const off = moto.oldPrice ? Math.round(((moto.oldPrice - moto.price) / moto.oldPrice) * 100) : 0
  const wa = waLink(waForMoto(moto.name))

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-card shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-blue/25 hover:shadow-card-hover focus-within:border-blue/40 [transform-style:preserve-3d] [transform:perspective(1100px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))_translateZ(0)]"
    >
      {/* Escenario de la moto */}
      <div className="relative overflow-hidden bg-paper2/70">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-light bg-grid opacity-45" />
          <div className="absolute left-1/2 top-1/2 h-40 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/[0.13] blur-[46px] transition-all duration-700 group-hover:bg-blue/20" />
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

        <div className="relative px-2 pb-0 pt-4 [transform:translateZ(30px)]">
          {moto.image ? (
            // Foto real: carga diferida y proporción reservada para no mover el layout
            <img
              src={moto.image}
              alt={`Moto eléctrica ${moto.name}`}
              width={900}
              height={520}
              loading="lazy"
              decoding="async"
              className="aspect-[900/520] w-full object-contain transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
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
      <div className="relative flex flex-1 flex-col p-4 [transform:translateZ(18px)] sm:p-5">
        <h3 className="font-display text-[1.4rem] font-bold uppercase leading-none text-ink">
          {moto.name}
        </h3>

        <ul className="mt-3 grid grid-cols-3 gap-1.5 border-y border-ink/[0.08] py-2.5">
          {[
            { Icon: IconRoute, v: `${moto.range} km`, l: 'Autonomía' },
            { Icon: IconGauge, v: `${moto.speed} km/h`, l: 'Velocidad' },
            { Icon: IconBattery, v: `${moto.power}W`, l: 'Motor' },
          ].map(({ Icon, v, l }) => (
            <li key={l} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4 shrink-0 text-blue" />
              <span className="min-w-0">
                <span className="block font-display text-[14px] font-bold leading-none text-ink">{v}</span>
                <span className="mt-0.5 block truncate text-[9px] font-semibold uppercase tracking-wider text-slate">
                  {l}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {moto.oldPrice && (
              <p className="text-[12px] font-medium text-slate line-through">{formatCOP(moto.oldPrice)}</p>
            )}
            <p className="font-display text-[1.5rem] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
              {formatCOP(moto.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(moto)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-[11px] font-semibold uppercase tracking-widest2 text-slate transition-colors hover:text-blue-deep"
            aria-label={`Ver detalles de ${moto.name}`}
          >
            Detalles
            <IconArrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>

        <a
          href={wa}
          target={wa.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-[46px] items-center justify-center rounded-full bg-ink text-[11.5px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-red-btn hover:shadow-glow-red active:scale-[0.98]"
        >
          Cotizar
        </a>
      </div>
    </article>
  )
}
