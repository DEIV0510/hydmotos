import { useEffect, useRef } from 'react'
import MotoArt from '@/components/art/MotoArt'
import { formatCOP, specsOf, type Moto } from '@/data/motos'
import { IconClose, IconWhatsApp } from '@/components/art/Icons'
import { waLink, waForMoto } from '@/lib/wa'

export default function MotoModal({ moto, onClose }: { moto: Moto | null; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!moto) return
    const prev = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeBtn.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panel.current) return
      // Mantener el foco dentro del diálogo
      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [moto, onClose])

  if (!moto) return null

  const off = moto.oldPrice ? Math.round(((moto.oldPrice - moto.price) / moto.oldPrice) * 100) : 0
  const wa = waLink(waForMoto(moto.name))

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 animate-[fade_.3s_ease-out_both] cursor-default bg-void/85 backdrop-blur-md"
        onClick={onClose}
        aria-label="Cerrar detalles"
        tabIndex={-1}
      />

      <div
        ref={panel}
        className="relative flex max-h-[92dvh] w-full max-w-3xl animate-[sheet_.42s_cubic-bezier(.16,1,.3,1)_both] flex-col overflow-hidden rounded-t-3xl border border-white/[0.09] bg-graphite sm:animate-[pop_.35s_cubic-bezier(.16,1,.3,1)_both] sm:rounded-3xl"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-void/70 text-chrome backdrop-blur transition-colors hover:border-cyan/50 hover:text-cyan"
          aria-label="Cerrar"
        >
          <IconClose className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          {/* Cabecera visual */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute inset-0 bg-grid-tech bg-grid opacity-30" />
              <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/25 blur-[70px]" />
            </div>
            {off > 0 && (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-red-btn px-3 py-1 text-[10px] font-bold uppercase tracking-widest2 text-white shadow-glow-red">
                Oferta −{off}%
              </span>
            )}
            <div className="relative px-4 pt-10 sm:px-10">
              {moto.image ? (
                <img
                  src={moto.image}
                  alt={`Moto eléctrica ${moto.name}`}
                  width={900}
                  height={520}
                  decoding="async"
                  className="mx-auto aspect-[900/520] w-full max-w-lg object-contain"
                />
              ) : (
                <MotoArt variant={moto.art} className="mx-auto w-full max-w-lg" />
              )}
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-10 sm:pb-10">
            <p className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan/70">
              H&amp;D Motorens
            </p>
            <h2
              id="modal-title"
              className="mt-1 font-display text-[clamp(2rem,7vw,2.9rem)] font-extrabold uppercase leading-none text-chrome"
            >
              {moto.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="font-display text-[clamp(1.7rem,6vw,2.4rem)] font-extrabold leading-none text-chrome [font-variant-numeric:tabular-nums]">
                {formatCOP(moto.price)}
              </p>
              {moto.oldPrice && (
                <p className="pb-1 text-base font-medium text-silver/72 line-through">
                  {formatCOP(moto.oldPrice)}
                </p>
              )}
            </div>

            {/* Ficha técnica completa */}
            <h3 className="mt-8 text-[11px] font-semibold uppercase tracking-widest2 text-cyan">
              Ficha técnica
            </h3>
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {specsOf(moto).map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] py-2.5"
                >
                  <dt className="text-[13px] text-silver/75">{s.label}</dt>
                  <dd className="text-right text-[13.5px] font-semibold text-chrome">{s.value}</dd>
                </div>
              ))}
            </dl>

            <a
              href={wa}
              target={wa.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-red-btn px-8 text-[13px] font-bold uppercase tracking-widest2 text-white shadow-glow-red transition-all duration-300 hover:bg-red active:scale-[0.98] sm:w-auto"
            >
              <IconWhatsApp className="h-5 w-5" />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade { from { opacity:0 } to { opacity:1 } }
        @keyframes sheet { from { opacity:0; transform: translateY(38px) } to { opacity:1; transform:none } }
        @keyframes pop { from { opacity:0; transform: translateY(16px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>
    </div>
  )
}
