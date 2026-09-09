import MotoArt from '@/components/art/MotoArt'
import { useTilt } from '@/hooks/useTilt'
import { formatCOP, type Moto } from '@/data/motos'
import { IconBattery, IconGauge, IconRoute, IconArrow } from '@/components/art/Icons'
import { waLink, waForMoto } from '@/lib/wa'

export default function MotoCard({ moto, onOpen }: { moto: Moto; onOpen: (m: Moto) => void }) {
  const tilt = useTilt<HTMLElement>(6)
  const off = moto.oldPrice
    ? Math.round(((moto.oldPrice - moto.price) / moto.oldPrice) * 100)
    : 0
  const wa = waLink(waForMoto(moto.name))

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] surface transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-cyan/30 hover:shadow-lift focus-within:border-cyan/40 [transform-style:preserve-3d] [transform:perspective(1100px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))_translateZ(0)] hover:-translate-y-1.5"
    >
      {/* brillo que sigue al cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(420px circle at var(--mx,50%) var(--my,0%), rgba(34,224,255,0.10), transparent 62%)',
        }}
        aria-hidden="true"
      />

      {/* ---------- Escenario de la moto ---------- */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-grid-tech bg-grid opacity-30" />
          <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/20 blur-[60px] transition-all duration-700 group-hover:bg-blue/30 group-hover:blur-[70px]" />
        </div>

        {/* Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2">
          {off > 0 && (
            <span className="rounded-full bg-red-btn px-3 py-1 text-[10px] font-bold uppercase tracking-widest2 text-white shadow-glow-red">
              Oferta −{off}%
            </span>
          )}
          {moto.matricula && (
            <span className="rounded-full border border-cyan/30 bg-void/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest2 text-cyan backdrop-blur">
              Con matrícula
            </span>
          )}
        </div>

        <div className="relative px-1.5 pb-0 pt-7 [transform:translateZ(38px)]">
          {moto.image ? (
            // Foto real: se carga en diferido y reserva su espacio para no
            // desplazar el layout (CLS). Mismo encuadre que el arte vectorial.
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
              className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
              title={`Ilustración de ${moto.name}`}
            />
          )}
        </div>
        {/* reflejo */}
        <div
          className="pointer-events-none absolute inset-x-8 bottom-2 h-6 rounded-[50%] bg-cyan/15 blur-xl transition-opacity duration-500 group-hover:bg-cyan/25"
          aria-hidden="true"
        />
      </div>

      {/* ---------- Datos ---------- */}
      <div className="relative flex flex-1 flex-col p-5 pt-3 [transform:translateZ(22px)] sm:p-6 sm:pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan/70">
          H&amp;D Motorens
        </p>
        <h3 className="mt-1 font-display text-[1.65rem] font-bold uppercase leading-none text-chrome">
          {moto.name}
        </h3>

        {/* Specs rápidas */}
        <ul className="mt-4 grid grid-cols-3 gap-2 border-y border-white/[0.07] py-3.5">
          {[
            { Icon: IconRoute, v: `${moto.range} km`, l: 'Autonomía' },
            { Icon: IconGauge, v: `${moto.speed} km/h`, l: 'Velocidad' },
            { Icon: IconBattery, v: `${moto.power}W`, l: 'Motor' },
          ].map(({ Icon, v, l }) => (
            <li key={l}>
              <Icon className="h-4 w-4 text-cyan/70" />
              <p className="mt-1.5 font-display text-[15px] font-bold leading-none text-chrome">{v}</p>
              <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wider text-silver/72">{l}</p>
            </li>
          ))}
        </ul>

        {/* Precio */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {moto.oldPrice && (
              <p className="text-[12.5px] font-medium text-silver/72 line-through">
                {formatCOP(moto.oldPrice)}
              </p>
            )}
            <p className="font-display text-[1.7rem] font-extrabold leading-none tracking-tight text-chrome [font-variant-numeric:tabular-nums]">
              {formatCOP(moto.price)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpen(moto)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold uppercase tracking-widest2 text-silver transition-colors hover:text-cyan"
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
          className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-bold uppercase tracking-widest2 text-chrome ring-1 ring-inset ring-white/10 transition-all duration-300 hover:bg-red-btn hover:text-white hover:shadow-glow-red hover:ring-red-btn active:scale-[0.98]"
        >
          Cotizar {moto.name}
        </a>
      </div>
    </article>
  )
}
