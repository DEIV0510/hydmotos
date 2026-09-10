import { useEffect, useState } from 'react'
import { LogoMark } from '@/components/art/Logo'

/**
 * Pantalla de arranque.
 * Se cierra en cuanto el documento termina de cargar, con un mínimo de
 * 900 ms para que la animación se lea y un techo duro de 1600 ms para
 * que nunca bloquee la página. Con `prefers-reduced-motion` no aparece.
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [gone, setGone] = useState(done)

  useEffect(() => {
    if (done) return
    const start = performance.now()
    const MIN = 900
    const MAX = 1600

    const finish = () => {
      const waited = performance.now() - start
      window.setTimeout(() => setDone(true), Math.max(0, MIN - waited))
    }

    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })

    const hardStop = window.setTimeout(() => setDone(true), MAX)
    return () => {
      window.removeEventListener('load', finish)
      window.clearTimeout(hardStop)
    }
  }, [done])

  // Desmontar tras la transición de salida
  useEffect(() => {
    if (!done) return
    document.body.style.overflow = ''
    const t = window.setTimeout(() => setGone(true), 620)
    return () => window.clearTimeout(t)
  }, [done])

  // Bloquear scroll solo mientras está visible
  useEffect(() => {
    if (gone || done) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [gone, done])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-void transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(.7,0,.2,1)] ${
        done ? 'pointer-events-none scale-[1.04] opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Cargando H&D MOTORENS"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-tech bg-grid opacity-25" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/10 blur-[80px]"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center px-6">
        <div className="animate-[boot-mark_.9s_cubic-bezier(.16,1,.3,1)_both]">
          <LogoMark size={72} />
        </div>

        {/* H&D + MOTORENS entran por separado */}
        <div className="mt-6 overflow-hidden">
          <p className="animate-[boot-up_.7s_cubic-bezier(.16,1,.3,1)_.18s_both] font-display text-[clamp(2.4rem,10vw,3.6rem)] font-extrabold leading-none tracking-wide text-chrome">
            H<span className="text-red">&amp;</span>D
          </p>
        </div>
        <div className="mt-1 overflow-hidden">
          <p className="animate-[boot-up_.7s_cubic-bezier(.16,1,.3,1)_.34s_both] font-display text-[clamp(1rem,4.6vw,1.6rem)] font-bold uppercase tracking-widest3 text-cyan">
            Motorens
          </p>
        </div>

        {/* Barra de energía con luz que la recorre */}
        <div className="relative mt-8 h-[3px] w-[min(240px,64vw)] overflow-hidden rounded-full bg-white/10">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-scan rounded-full bg-gradient-to-r from-transparent via-cyan to-transparent" />
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest3 text-silver/72">
          Movilidad eléctrica
        </p>
      </div>

      <style>{`
        @keyframes boot-up { from { transform: translateY(105%); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes boot-mark { from { transform: scale(.82); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  )
}
