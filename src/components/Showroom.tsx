import { useEffect, useRef, useState } from 'react'
import { Button, Reveal } from '@/components/ui/Primitives'
import { IconBolt, IconTools, IconWhatsApp } from '@/components/art/Icons'
import { useCatalogoVivo } from '@/lib/motos-live'
import { useRepuestosVivo } from '@/lib/repuestos-live'
import { marcoDeVideo, useSettingsVivo } from '@/lib/settings-live'
import { useWa } from '@/lib/wa'

const WA_LOCAL = 'Hola, ¿cómo llego al local de H&D MOTORENS?'

/**
 * Vídeo del local.
 * Es la prueba de que la tienda existe de verdad, así que va antes del CTA
 * final. El vídeo solo empieza a cargarse cuando la sección entra en pantalla
 * (`preload="none"` + IntersectionObserver): así no pesa en la carga inicial.
 * Con `prefers-reduced-motion` se queda en el póster, sin reproducir.
 *
 * Los textos se limitan a lo comprobable. Antes prometía todos los modelos en
 * exhibición para probar, un horario y atención sin cita, y nada de eso lo
 * había confirmado el cliente.
 */
export default function Showroom() {
  const { waLink, waReady } = useWa()
  const { videos } = useSettingsVivo()
  const { stats: STATS } = useCatalogoVivo()
  const { stats: STATS_REPUESTOS } = useRepuestosVivo()
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [cerca, setCerca] = useState(false)
  const enPantalla = useRef(false)

  // El cliente puede cambiar este video desde /admin/contenido → Videos (nota
  // de voz del 23/09); sin eso, el recorrido original del local, vertical.
  const propio = videos.showroom
  const src = propio?.src ?? '/video/showroom.mp4'
  const poster = propio ? (propio.poster ?? undefined) : '/video/showroom-poster.jpg'
  const marco = propio
    ? marcoDeVideo(propio, 'max-w-[300px] lg:max-w-[340px]')
    : { style: { aspectRatio: '9 / 16' }, className: 'mx-auto w-full max-w-[300px] lg:max-w-[340px]' }

  useEffect(() => {
    const el = box.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Sigue observando después de la primera vez: así el video se pausa al
    // salir de la sección y sigue al volver, en vez de correr fuera de pantalla
    const io = new IntersectionObserver(
      ([e]) => {
        enPantalla.current = e.isIntersecting
        if (!e.isIntersecting) {
          video.current?.pause()
          return
        }
        setCerca(true)
        // La primera vez aún no hay <source>: arranca el efecto de abajo
        if (video.current?.querySelector('source')) video.current.play().catch(() => {})
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Arranca cuando la fuente ya está montada (y otra vez si cambia el video)
  useEffect(() => {
    if (!cerca || !enPantalla.current) return
    video.current?.play().catch(() => {
      /* el navegador puede bloquear el autoplay: se queda el póster */
    })
  }, [cerca, src])

  const puntos = [
    { Icon: IconBolt, t: `${STATS.total} modelos en catálogo`, d: 'Motos, scooters y bicicletas eléctricas.' },
    // Sin «con precio y referencia»: desde el panel se puede crear uno sin ninguno de los dos
    { Icon: IconTools, t: `${STATS_REPUESTOS.total} repuestos`, d: 'Búscalos por nombre o referencia.' },
    { Icon: IconWhatsApp, t: 'Atención por WhatsApp', d: 'Pregunta por modelos, repuestos y cómo llegar.' },
  ]
  const wa = waLink(WA_LOCAL)

  return (
    <section className="relative bg-void py-16 sm:py-24">
      <div className="mx-auto grid max-w-content items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_0.78fr] lg:gap-14">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
              09 · Nuestro local
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,6vw,3.6rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
              Así es
              <br />
              la tienda
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
              Un recorrido real por el local de H&amp;D MOTORENS. Escríbenos y te indicamos cómo
              llegar.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <ul className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {puntos.map(({ Icon, t, d }) => (
                <li key={t} className="flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-chrome">{t}</span>
                    <span className="block text-[13.5px] text-silver">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8">
              <Button href={wa} external={waReady}>
                Pregunta cómo llegar
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Vertical en el marco de un teléfono; si el del panel es horizontal, a lo ancho */}
        <Reveal delay={140}>
          <div ref={box} className={`relative ${marco.className}`}>
            <div className="absolute -inset-5 rounded-[42px] bg-blue/8 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-graphite shadow-lift">
              <video
                key={src}
                ref={video}
                poster={poster}
                muted
                loop
                playsInline
                preload="none"
                aria-label="Recorrido por el local de H&D MOTORENS"
                style={marco.style}
                className="block w-full object-cover"
              >
                {cerca && <source src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />}
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
