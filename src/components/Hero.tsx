import { useEffect, useRef } from 'react'
import { Button, DataStrip, TechFrame } from '@/components/ui/Primitives'
import { IconArrow } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { STATS_REPUESTOS } from '@/data/repuestos'
import { useCatalogoVivo } from '@/lib/motos-live'
import { WA_GENERAL, waLink, waReady } from '@/lib/wa'

/**
 * Portada: el vídeo del carro ocupa todo el hero, de fondo, con el mensaje de
 * la tienda encima.
 *
 * El cliente añadió un vídeo del carro (`carrohero.mp4`, en la carpeta Motors)
 * y pidió ponerlo en TODO el hero, no en una parte: por eso va a sangre, de
 * lado a lado y hasta detrás del menú (que es transparente antes de hacer
 * scroll), en vez de en un recuadro al lado del texto.
 * `scripts/build-hero-video.mjs` lo procesa a dos anchos —escritorio y
 * celular, elegidos por `<source media>`— y saca el póster del primer
 * fotograma.
 *
 * Encima solo lleva un velo oscuro parejo (no un recorte ni un fundido sobre
 * el carro): deja ver el vídeo completo durante todo el bucle y mantiene el
 * texto legible pase lo que pase en la escena. En el material no hay nombre,
 * precio ni ficha del carro, así que la portada no afirma nada sobre él: el
 * enlace lleva a la sección de carros eléctricos.
 *
 * Se reproduce siempre, incluso con «reducir movimiento»: así lo pidió el
 * cliente ("que el video se reproduzca automaticamente", 16/09). Va muted +
 * loop + playsInline, que es lo que permite el autoplay en el navegador; el
 * parallax de abajo sigue respetando esa preferencia, solo el vídeo no.
 */

const VIDEO_HERO = '/video/hero.mp4'
const VIDEO_HERO_MOVIL = '/video/hero-mobile.mp4'
const POSTER_HERO = '/video/hero-poster.jpg'

/** Desplaza el vídeo unos píxeles con el cursor. Solo con ratón y sin movimiento reducido. */
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
        el.style.transform = `translate3d(${(-x * 10).toFixed(1)}px, ${(-y * 6).toFixed(1)}px, 0) scale(1.02)`
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

/**
 * Refuerza el autoplay por si el atributo solo no basta (pasa en algunos
 * navegadores móviles). Si el navegador igual lo bloquea, reintenta en el
 * primer toque o clic en la página: eso ya cuenta como interacción del
 * usuario y el navegador lo permite.
 */
function useForzarAutoplay() {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const intentar = () => v.play().catch(() => {})
    intentar()

    const reintentar = () => {
      intentar()
      window.removeEventListener('pointerdown', reintentar)
      window.removeEventListener('keydown', reintentar)
    }
    window.addEventListener('pointerdown', reintentar, { once: true, passive: true })
    window.addEventListener('keydown', reintentar, { once: true })
    return () => {
      window.removeEventListener('pointerdown', reintentar)
      window.removeEventListener('keydown', reintentar)
    }
  }, [])

  return ref
}

export default function Hero() {
  const wa = waLink(WA_GENERAL)
  const capa = useParallax<HTMLDivElement>()
  const { stats: STATS } = useCatalogoVivo()
  const video = useForzarAutoplay()

  const cifras = [
    { v: String(STATS.total), l: 'Modelos' },
    { v: String(STATS_REPUESTOS.total), l: 'Repuestos' },
    { v: formatCOP(STATS.minPrice), l: 'Precio desde' },
  ]

  return (
    <section id="inicio" className="relative isolate overflow-hidden bg-void pt-[74px]">
      {/*
        Vídeo de fondo a sangre en TODO el hero: el -top-[74px] lo estira hasta
        el borde real de la pantalla, por detrás del menú (transparente hasta
        que se hace scroll), y bottom-0 lo cierra al pie de la sección.
      */}
      <div
        ref={capa}
        className="absolute inset-x-0 -top-[74px] bottom-0 -z-10 animate-[hero-car_1.3s_ease-out_both] transition-transform duration-700 ease-out will-change-transform"
      >
        <video
          ref={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={POSTER_HERO}
          aria-hidden="true"
          className="h-full w-full object-cover"
        >
          <source src={VIDEO_HERO_MOVIL} media="(max-width: 767px)" type="video/mp4" />
          <source src={VIDEO_HERO} type="video/mp4" />
        </video>

        {/*
          Velo parejo, no un recorte del carro: la cámara del vídeo se acerca
          mucho al final del bucle, así que el carro llega a ocupar casi todo
          el encuadre justo donde va el texto. El velo tiene que quedar oscuro
          ahí incluso contra la carrocería plateada bajo los neones —de ahí la
          opacidad alta— y solo se aclara donde no hay texto encima.
        */}
        <div
          className="pointer-events-none absolute inset-0 bg-void/85 lg:bg-gradient-to-r lg:from-void/97 lg:via-void/88 lg:to-void/25"
          aria-hidden="true"
        />
        {/* Textura técnica muy sutil, solo del lado del texto: aporta el
            carácter "ingeniería" sin ensuciar la lectura sobre el vídeo */}
        <div
          className="pointer-events-none absolute inset-0 hidden bg-grid-tech bg-grid opacity-[0.15] [mask-image:linear-gradient(to_right,black,transparent_42%)] lg:block"
          aria-hidden="true"
        />
      </div>

      {/* Marcas de esquina: el hero como un visor, no como una foto de stock */}
      <TechFrame inset={18} size={20} />

      {/* Rótulo lateral, solo en pantallas grandes: como la ficha técnica de un catálogo */}
      <div
        className="pointer-events-none absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 xl:block"
        aria-hidden="true"
      >
        <span
          className="block text-[10px] font-semibold uppercase tracking-[0.5em] text-silver/55 [transform:rotate(180deg)] [writing-mode:vertical-rl]"
        >
          H&amp;D Motorens · Movilidad eléctrica
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-content px-5 pt-8 sm:px-8 sm:pt-10 lg:px-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))] lg:pt-14">
        <div className="max-w-xl pb-12 sm:pb-14 lg:pb-16">
          {/* Marca + categoría: lo primero que se lee, antes que el eslogan */}
          <div className="animate-[hero-in_.6s_ease-out_.2s_both]">
            <div className="flex items-center gap-3">
              <span className="h-px w-9 bg-cyan" aria-hidden="true" />
              <p className="text-[12.5px] font-extrabold uppercase tracking-widest3 text-chrome sm:text-[13.5px]">
                H&amp;D Motorens
              </p>
            </div>
            <p className="mt-1.5 pl-[3rem] text-[10.5px] font-semibold uppercase tracking-widest2 text-cyan sm:text-[11px]">
              Movilidad eléctrica
            </p>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.6rem,11.5vw,3.8rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-chrome sm:text-[clamp(3.4rem,8vw,4.4rem)] lg:text-[clamp(3rem,4.8vw,5.6rem)]">
            <span className="block animate-[hero-in_.7s_ease-out_.32s_both]">La ciudad,</span>
            <span className="block animate-[hero-in_.7s_ease-out_.42s_both]">
              sin gasolina<span className="text-red">.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-[30rem] animate-[hero-in_.7s_ease-out_.52s_both] text-[15.5px] leading-relaxed text-silver sm:text-[17px]">
            Motos, patinetas y carros eléctricos, con taller y repuestos en un solo lugar. Elige tu
            modelo y consúltalo por WhatsApp.
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

          <a
            href="#carros"
            className="mt-4 inline-flex min-h-[44px] animate-[hero-in_.7s_ease-out_.68s_both] items-center gap-2 text-[13.5px] font-semibold text-silver underline-offset-4 transition-colors hover:text-chrome hover:underline"
          >
            ¿Te interesa el carro? Ver carros eléctricos
            <IconArrow className="h-3.5 w-3.5 text-cyan" />
          </a>
        </div>
      </div>

      {/* Franja de datos a lo ancho: lectura de tablero, no una lista suelta */}
      <div className="relative z-10 animate-[hero-in_.7s_ease-out_.78s_both] border-t border-white/[0.14] bg-void/45 backdrop-blur-sm">
        <div className="mx-auto max-w-content px-5 py-5 sm:px-8 sm:py-6">
          <DataStrip items={cifras} tone="light" size="md" />
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
        @keyframes hero-car { from { opacity:0; transform: scale(1.06) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}
