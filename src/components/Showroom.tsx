import { useEffect, useRef, useState } from 'react'
import { Button, Reveal } from '@/components/ui/Primitives'
import { IconPin, IconClock, IconShield } from '@/components/art/Icons'
import { STATS } from '@/data/motos'
import { SCHEDULE } from '@/data/site'
import { waLink, WA_GENERAL } from '@/lib/wa'

/**
 * Vídeo del local.
 * Es la prueba de que la tienda existe de verdad, así que va antes del CTA
 * final. El vídeo solo empieza a cargarse cuando la sección entra en pantalla
 * (`preload="none"` + IntersectionObserver): así no pesa en la carga inicial.
 * Con `prefers-reduced-motion` se queda en el póster, sin reproducir.
 */
export default function Showroom() {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [cerca, setCerca] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          video.current?.pause()
          return
        }
        setCerca(true)
        io.disconnect()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Arranca solo cuando la fuente ya está montada
  useEffect(() => {
    if (!cerca) return
    video.current?.play().catch(() => {
      /* el navegador puede bloquear el autoplay: se queda el póster */
    })
  }, [cerca])

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-tech bg-grid opacity-40" />
        <div className="absolute -left-32 top-1/2 h-[440px] w-[440px] -translate-y-1/2 rounded-full bg-blue/15 blur-[120px]" />
      </div>

      <div className="mx-auto grid max-w-content items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.78fr] lg:gap-14">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
              Nuestro local
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-display text-[clamp(2rem,6vw,3.4rem)] font-extrabold uppercase leading-[0.94] tracking-tight text-chrome">
              Ven, míralas
              <br />y pruébalas
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
              Tenemos {STATS.total} modelos en exhibición. Pásate por el local, súbete a la que te
              guste y resuelve tus dudas con nosotros.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <ul className="mt-8 space-y-3">
              {[
                { Icon: IconPin, t: 'Showroom abierto', d: 'Todos los modelos disponibles para ver y probar.' },
                { Icon: IconClock, t: SCHEDULE, d: 'Te atendemos sin cita previa.' },
                { Icon: IconShield, t: 'Garantía y respaldo', d: 'Compra con acompañamiento antes y después.' },
              ].map(({ Icon, t, d }) => (
                <li key={t} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-semibold text-chrome">{t}</span>
                    <span className="block text-[13.5px] text-silver">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8">
              <Button href={waLink(WA_GENERAL)} external={waLink(WA_GENERAL).startsWith('http')}>
                Escríbenos
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Vídeo vertical, en el marco de un teléfono */}
        <Reveal delay={140}>
          <div ref={box} className="relative mx-auto w-full max-w-[300px] lg:max-w-[340px]">
            <div
              className="absolute -inset-5 rounded-[42px] bg-blue/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-graphite shadow-lift">
              <video
                ref={video}
                poster="/video/showroom-poster.jpg"
                muted
                loop
                playsInline
                preload="none"
                aria-label="Recorrido por el local de H&D MOTORENS"
                className="block aspect-[9/16] w-full object-cover"
              >
                {cerca && <source src="/video/showroom.mp4" type="video/mp4" />}
              </video>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void/75 to-transparent"
                aria-hidden="true"
              />
              <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/15 bg-void/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest2 text-chrome backdrop-blur">
                H&amp;D Motorens
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
