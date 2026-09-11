import { useEffect, useRef } from 'react'
import { IconClose, IconWhatsApp } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { photoOfPart, type Repuesto } from '@/data/repuestos'
import { waLink, waReady } from '@/lib/wa'

export function waForPart(r: Repuesto) {
  return `Hola, quiero pedir este repuesto de H&D MOTORENS: ${r.name}${
    r.sku ? ` (ref. ${r.sku})` : ''
  }.`
}

export default function PartModal({
  part,
  onClose,
  icon: Icon,
}: {
  part: Repuesto | null
  onClose: () => void
  icon: (p: { className?: string }) => JSX.Element
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!part) return
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
  }, [part, onClose])

  if (!part) return null

  const foto = photoOfPart(part)
  const wa = waLink(waForPart(part))
  const off =
    part.oldPrice && part.price
      ? Math.round(((part.oldPrice - part.price) / part.oldPrice) * 100)
      : 0

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="part-modal-title"
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
        className="relative flex max-h-[92dvh] w-full max-w-3xl animate-[sheet_.42s_cubic-bezier(.16,1,.3,1)_both] flex-col overflow-hidden rounded-t-3xl border border-ink/[0.09] bg-card sm:animate-[pop_.35s_cubic-bezier(.16,1,.3,1)_both] sm:rounded-3xl"
      >
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-ink/12 bg-card/85 text-ink backdrop-blur transition-colors hover:border-blue/50 hover:text-blue-deep"
          aria-label="Cerrar"
        >
          <IconClose className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain">
          <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            {/* Foto */}
            <div className="relative bg-white">
              {off > 0 && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-red-btn px-3 py-1 text-[10px] font-bold uppercase tracking-widest2 text-white">
                  Oferta −{off}%
                </span>
              )}
              {foto ? (
                <img
                  src={foto.src2x}
                  alt={part.name}
                  width={720}
                  height={720}
                  decoding="async"
                  className="mx-auto aspect-square w-full max-w-[380px] object-contain p-5"
                />
              ) : (
                <span className="flex aspect-square w-full items-center justify-center bg-paper2 text-slate">
                  <Icon className="h-16 w-16" />
                </span>
              )}
            </div>

            {/* Datos */}
            <div className="px-5 pb-7 pt-6 sm:px-8 sm:pb-9 sm:pt-10">
              <p className="text-[10px] font-semibold uppercase tracking-widest2 text-blue-deep">
                {part.category}
                {part.sub ? ` · ${part.sub}` : ''}
              </p>
              <h2
                id="part-modal-title"
                className="mt-1.5 pr-10 text-[clamp(1.25rem,3.6vw,1.65rem)] font-extrabold leading-tight text-ink"
              >
                {part.name}
              </h2>
              {part.sku && (
                <p className="mt-2 inline-flex rounded-md border border-ink/12 px-2 py-1 text-[11px] font-semibold tracking-wide text-slate">
                  Ref. {part.sku}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                {part.price ? (
                  <>
                    <p className="font-display text-[clamp(1.6rem,5vw,2.1rem)] font-extrabold leading-none text-ink [font-variant-numeric:tabular-nums]">
                      {formatCOP(part.price)}
                    </p>
                    {part.oldPrice && (
                      <p className="pb-1 text-base font-medium text-slate line-through">
                        {formatCOP(part.oldPrice)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-display text-[1.25rem] font-bold uppercase leading-none tracking-wide text-blue-deep">
                    Precio por WhatsApp
                  </p>
                )}
              </div>

              {part.available === false && (
                <p className="mt-3 inline-flex rounded-full bg-ink/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest2 text-slate">
                  Sujeto a disponibilidad
                </p>
              )}

              {part.description && (
                <p className="mt-5 whitespace-pre-line text-[14.5px] leading-relaxed text-slate">
                  {part.description}
                </p>
              )}

              {part.specs && part.specs.length > 0 && (
                <dl className="mt-6 grid">
                  {part.specs.map((s) => (
                    <div
                      key={s.label}
                      className="flex items-baseline justify-between gap-4 border-b border-ink/[0.07] py-2.5"
                    >
                      <dt className="text-[13px] text-slate">{s.label}</dt>
                      <dd className="text-right text-[13.5px] font-semibold text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <a
                href={wa}
                target={waReady ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-red-btn px-8 text-[13px] font-bold uppercase tracking-widest2 text-white shadow-glow-red transition-all duration-300 hover:bg-red active:scale-[0.98]"
              >
                <IconWhatsApp className="h-5 w-5" />
                Pedir por WhatsApp
              </a>
            </div>
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
