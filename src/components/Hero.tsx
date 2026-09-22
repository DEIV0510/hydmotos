import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Primitives'
import { useSettingsVivo } from '@/lib/settings-live'

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
  const { hero } = useSettingsVivo()
  const capa = useParallax<HTMLDivElement>()
  const video = useForzarAutoplay()

  return (
    <section id="inicio" className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-void pt-[74px] sm:min-h-[92vh]">
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
          poster={hero.poster ?? POSTER_HERO}
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
      </div>

      {/*
        Una sola idea: marca, eslogan, un botón. Nada compite con el carro —
        sin franjas de datos, sin marcas técnicas, sin segundo CTA: eso ya
        vive en el marquee y en cada sección (pidió el cliente "menos
        información, más impacto, más espacio, más producto", 20/09).
      */}
      <div className="relative z-10 mx-auto w-full max-w-content px-5 sm:px-8 lg:px-[max(2rem,calc((100vw_-_84rem)/2_+_2rem))]">
        <div className="max-w-xl">
          <p className="animate-[hero-in_.6s_ease-out_.2s_both] text-[12px] font-extrabold uppercase tracking-widest3 text-chrome sm:text-[13px]">
            H&amp;D Motorens
            <span className="mx-2.5 text-cyan">·</span>
            <span className="text-cyan">{hero.kicker}</span>
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.8rem,12vw,4rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-chrome sm:text-[clamp(3.6rem,8.5vw,4.8rem)] lg:text-[clamp(3.4rem,5.2vw,6rem)]">
            <span className="block animate-[hero-in_.7s_ease-out_.32s_both]">{hero.title1}</span>
            <span className="block animate-[hero-in_.7s_ease-out_.42s_both]">
              {hero.title2}
              <span className="text-red">.</span>
            </span>
          </h1>

          <div className="mt-9 animate-[hero-in_.7s_ease-out_.52s_both]">
            <Button href={hero.ctaHref} variant="outline">
              {hero.ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
        @keyframes hero-car { from { opacity:0; transform: scale(1.06) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}
