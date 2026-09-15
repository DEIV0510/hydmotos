import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Primitives'
import { IconArrow, IconWhatsApp } from '@/components/art/Icons'
import { CARRO, type Media } from '@/data/media'
import { STATS, formatCOP } from '@/data/motos'
import { STATS_REPUESTOS } from '@/data/repuestos'
import { prioridad } from '@/lib/img'
import { WA_GENERAL, waLink, waReady } from '@/lib/wa'

/**
 * Portada: el carro es el protagonista.
 *
 * Las fotos del carro son exteriores (asfalto mojado, árboles, cielo gris), no
 * un render recortado. El vehículo no se toca: la foto va entera y con su
 * proporción, sin filtros de color, y lo que se funde con el fondo oscuro son
 * sus bordes (cielo, suelo y laterales), nunca la carrocería.
 *
 * En el material no hay nombre, precio ni ficha del carro, así que la portada
 * no afirma nada sobre él: el titular es el de la tienda y el enlace del carro
 * solo pregunta por él.
 */

const FOTO = CARRO.find((m) => m.id === 'tres-cuartos') as Media

const WA_CARRO = 'Hola, quiero información sobre el carro que aparece en la portada de H&D MOTORENS.'

/** Desplaza la foto unos píxeles con el cursor. Solo con ratón y sin movimiento reducido. */
function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fino || reducido) return

    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        el.style.transform = `translate3d(${(-x * 16).toFixed(1)}px, ${(-y * 8).toFixed(1)}px, 0)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}

export default function Hero() {
  const wa = waLink(WA_GENERAL)
  const waCarro = waLink(WA_CARRO)
  const capa = useParallax<HTMLDivElement>()

  const cifras = [
    { v: String(STATS.total), l: 'Modelos' },
    { v: String(STATS_REPUESTOS.total), l: 'Repuestos' },
    { v: formatCOP(STATS.minPrice), l: 'Precio desde' },
  ]

  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-void pt-[74px] lg:flex lg:min-h-[min(100svh,960px)] lg:items-center"
    >
      {/*
        Sin luces de fondo detrás de la foto: sus fundidos terminan en el color
        void, y cualquier tinte alrededor dejaba ver el borde de la foto como un
        recuadro (se notaba en 1024 y 1920 px).
      */}

      {/*
        Móvil: la foto arriba, a sangre, y el texto debajo.
        Escritorio: el texto alineado con el resto de secciones y la foto
        llegando hasta el borde derecho de la pantalla.
      */}
      <div className="relative w-full lg:grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:pl-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))]">
        {/* ---------------- Carro ---------------- */}
        <figure className="relative animate-[hero-car_1.1s_cubic-bezier(.16,1,.3,1)_.15s_both] lg:order-2 lg:-ml-[4%]">
          <div ref={capa} className="transition-transform duration-700 ease-out will-change-transform">
            <div
              className="relative overflow-hidden bg-cover bg-center"
              style={{
                aspectRatio: `${FOTO.width} / ${FOTO.height}`,
                // Vista previa difuminada mientras llega la foto
                backgroundImage: FOTO.lqip ? `url(${FOTO.lqip})` : undefined,
              }}
            >
              <img
                src={FOTO.src}
                srcSet={FOTO.srcSet}
                sizes="(min-width: 1024px) 60vw, 100vw"
                width={FOTO.width}
                height={FOTO.height}
                alt={FOTO.alt}
                {...prioridad('high')}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Fundidos: cielo, suelo y laterales; la carrocería queda intacta */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-void via-void/65 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-void via-void/60 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-[8%] bg-gradient-to-r from-void to-transparent lg:w-[24%] lg:via-void/45" />
                <div className="absolute inset-y-0 right-0 w-[6%] bg-gradient-to-l from-void to-transparent" />
              </div>
            </div>
          </div>

          <figcaption className="absolute bottom-[9%] right-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))] z-10 hidden lg:block">
            <a
              href={waCarro}
              target={waReady ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group inline-flex min-h-[46px] items-center gap-2.5 rounded-full border border-white/15 bg-void/55 py-1.5 pl-1.5 pr-4 text-[12.5px] font-semibold text-chrome backdrop-blur-md transition-colors duration-300 hover:border-white/35 hover:bg-void/75"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366]">
                <IconWhatsApp className="h-4 w-4" />
              </span>
              Pregunta por este carro
              <IconArrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </figcaption>
        </figure>

        {/* ---------------- Mensaje ---------------- */}
        <div className="relative z-10 -mt-4 px-5 pb-14 sm:-mt-12 sm:px-8 sm:pb-16 lg:order-1 lg:mt-0 lg:px-0 lg:py-14">
          <p className="inline-flex animate-[hero-in_.6s_ease-out_.25s_both] items-center gap-3 text-[11px] font-semibold uppercase tracking-widest2 text-silver">
            <span className="h-px w-8 bg-red" aria-hidden="true" />
            <span className="hidden sm:inline">H&amp;D Motorens · </span>
            Movilidad eléctrica
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.6rem,11.5vw,3.8rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-chrome sm:text-[clamp(3.4rem,8vw,4.4rem)] lg:text-[clamp(3rem,4.6vw,5.2rem)]">
            <span className="block animate-[hero-in_.7s_ease-out_.32s_both]">La ciudad,</span>
            <span className="block animate-[hero-in_.7s_ease-out_.42s_both]">
              sin gasolina<span className="text-red">.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-[30rem] animate-[hero-in_.7s_ease-out_.52s_both] text-[15.5px] leading-relaxed text-silver sm:text-[17px]">
            Motos eléctricas y repuestos en un solo lugar. Elige tu modelo y consúltalo por WhatsApp.
          </p>

          {/* Tracking algo más corto que el botón base: así caben los dos en una
              fila en portátiles de 1366 px */}
          <div className="mt-8 flex animate-[hero-in_.7s_ease-out_.62s_both] flex-col flex-wrap gap-3 sm:flex-row">
            <Button href={wa} external={waReady} className="sm:!px-6 sm:!tracking-[0.16em]">
              Consultar por WhatsApp
            </Button>
            <Button href="#motos" variant="outline" className="sm:!px-6 sm:!tracking-[0.16em]">
              Ver catálogo
            </Button>
          </div>

          {/* En escritorio este enlace va sobre la foto */}
          <a
            href={waCarro}
            target={waReady ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[44px] animate-[hero-in_.7s_ease-out_.68s_both] items-center gap-2 text-[13.5px] font-semibold text-silver underline-offset-4 transition-colors hover:text-chrome hover:underline lg:hidden"
          >
            ¿Te interesa el carro de la foto? Pregúntanos
            <IconArrow className="h-3.5 w-3.5" />
          </a>

          <dl className="mt-8 grid max-w-[30rem] animate-[hero-in_.7s_ease-out_.74s_both] grid-cols-3 gap-4 border-t border-white/[0.09] pt-5 lg:mt-10">
            {cifras.map((c) => (
              // La etiqueta va antes en el DOM (dt antes que dd) y se pinta debajo
              <div key={c.l} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-silver">{c.l}</dt>
                <dd className="font-display text-[clamp(1.15rem,3.6vw,1.6rem)] font-bold leading-none text-chrome [font-variant-numeric:tabular-nums]">
                  {c.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
        @keyframes hero-car { from { opacity:0; transform: translateX(3%) scale(1.03) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}
