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
 * un render recortado. La foto va entera, con su proporción y sin filtros ni
 * fundidos en los bordes: el cliente pidió verla completa. Va en un marco con
 * esquinas redondeadas y borde fino, como el resto de fotos grandes de la web.
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
        el.style.transform = `translate3d(${(-x * 8).toFixed(1)}px, ${(-y * 4).toFixed(1)}px, 0)`
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
        Móvil: la foto arriba y el texto debajo.
        Escritorio: texto y foto dentro del mismo ancho que el resto de
        secciones. Columnas 0,9 / 1,1: con menos, los dos botones ya no caben
        en una fila en el portátil de 1366 px del cliente.
      */}
      <div className="relative w-full lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10 lg:px-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))]">
        {/* ---------------- Carro ---------------- */}
        <figure className="relative animate-[hero-car_1.1s_cubic-bezier(.16,1,.3,1)_.15s_both] px-5 pt-4 sm:px-8 sm:pt-6 lg:order-2 lg:px-0 lg:pt-0">
          <div ref={capa} className="transition-transform duration-700 ease-out will-change-transform">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-graphite bg-cover bg-center shadow-lift sm:rounded-3xl"
              style={{
                aspectRatio: `${FOTO.width} / ${FOTO.height}`,
                // Vista previa difuminada mientras llega la foto
                backgroundImage: FOTO.lqip ? `url(${FOTO.lqip})` : undefined,
              }}
            >
              <img
                src={FOTO.src}
                srcSet={FOTO.srcSet}
                sizes="(min-width: 1024px) 700px, 92vw"
                width={FOTO.width}
                height={FOTO.height}
                alt={FOTO.alt}
                {...prioridad('high')}
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Debajo de la foto y no encima: así no tapa ninguna parte del carro */}
          <figcaption className="mt-4 hidden justify-end lg:flex">
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
        <div className="relative z-10 px-5 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:order-1 lg:px-0 lg:py-14">
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

          {/* En escritorio este enlace va bajo la foto */}
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
