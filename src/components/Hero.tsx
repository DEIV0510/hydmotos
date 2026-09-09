import { useEffect, useRef, useState } from 'react'
import MotoArt from '@/components/art/MotoArt'
import { Button } from '@/components/ui/Primitives'
import { STATS, formatCOP } from '@/data/motos'
import { waLink, WA_GENERAL } from '@/lib/wa'

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [depth, setDepth] = useState({ x: 0, y: 0 })
  const [scrolled, setScrolled] = useState(0)

  // Parallax por cursor (solo puntero fino, sin motion reducido)
  useEffect(() => {
    if (
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setDepth({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        })
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Parallax por scroll
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => setScrolled(Math.min(window.scrollY, 700))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="inicio" className="relative isolate overflow-hidden pb-16 pt-[104px] sm:pb-24 sm:pt-[128px]">
      {/* --- Capas de fondo --- */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-tech bg-grid opacity-60" />
        {/* halo azul principal */}
        <div
          className="absolute left-1/2 top-[38%] h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/20 blur-[130px]"
          style={{ transform: `translate3d(calc(-50% + ${depth.x * 22}px), calc(-50% + ${depth.y * 16}px), 0)` }}
        />
        {/* acento rojo, discreto */}
        <div className="absolute -right-24 top-24 h-[380px] w-[380px] rounded-full bg-red/10 blur-[120px]" />
        {/* trazas de circuito */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.28]" preserveAspectRatio="none" viewBox="0 0 1440 900">
          <g fill="none" stroke="#22E0FF" strokeWidth="1">
            <path d="M0 210 H420 L520 110 H900" strokeOpacity=".5" />
            <path d="M1440 640 H1040 L940 740 H520" strokeOpacity=".38" />
            <path d="M120 900 V620 L220 520 V300" strokeOpacity=".3" />
          </g>
          <g fill="#22E0FF">
            <circle cx="420" cy="210" r="3.5" /><circle cx="900" cy="110" r="3.5" />
            <circle cx="1040" cy="640" r="3.5" /><circle cx="220" cy="300" r="3.5" />
          </g>
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
      </div>

      <div className="mx-auto grid max-w-content items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.02fr_1.1fr] lg:gap-6">
        {/* ---------------- Copy ---------------- */}
        <div className="relative z-10 max-w-xl">
          <p className="eyebrow animate-[hero-in_.7s_cubic-bezier(.16,1,.3,1)_.05s_both]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            {STATS.total} modelos eléctricos disponibles
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.9rem,10.5vw,5.6rem)] font-extrabold uppercase leading-[0.9] tracking-tight text-chrome">
            <span className="block animate-[hero-in_.8s_cubic-bezier(.16,1,.3,1)_.14s_both]">La ciudad,</span>
            <span className="block animate-[hero-in_.8s_cubic-bezier(.16,1,.3,1)_.26s_both]">
              sin{' '}
              <span className="relative inline-block text-transparent [-webkit-background-clip:text] [background-clip:text] [background-image:linear-gradient(100deg,#7DF0FF,#2E7BFF_55%,#7DF0FF)]">
                gasolina
              </span>
              <span className="text-red">.</span>
            </span>
          </h1>

          <p className="mt-6 max-w-md animate-[hero-in_.8s_cubic-bezier(.16,1,.3,1)_.38s_both] text-[15.5px] leading-relaxed text-silver sm:text-[17px]">
            Motos eléctricas listas para rodar. Hasta {STATS.maxRange} km de autonomía y modelos
            que <strong className="font-semibold text-chrome">no exigen SOAT ni matrícula</strong>.
          </p>

          <div className="mt-9 flex animate-[hero-in_.8s_cubic-bezier(.16,1,.3,1)_.5s_both] flex-col gap-3 xs:flex-row">
            <Button href={waLink(WA_GENERAL)} external={waLink(WA_GENERAL).startsWith('http')}>
              Cotizar ahora
            </Button>
            <Button href="#motos" variant="outline">
              Ver motos
            </Button>
          </div>

          {/* Cifras de respaldo */}
          <dl className="mt-11 grid animate-[hero-in_.8s_cubic-bezier(.16,1,.3,1)_.62s_both] grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
            {[
              { v: `${STATS.maxRange} km`, l: 'Autonomía máx.' },
              { v: `${STATS.maxSpeed} km/h`, l: 'Velocidad máx.' },
              { v: `Desde ${formatCOP(STATS.minPrice).replace(/\s?COP/, '')}`, l: 'Precio' },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-[clamp(1.15rem,3.6vw,1.6rem)] font-bold leading-none text-chrome">
                  {s.v}
                </dd>
                <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-silver/75">
                  {s.l}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- Composición del vehículo ---------------- */}
        <div
          ref={stageRef}
          className="relative animate-[hero-stage_1s_cubic-bezier(.16,1,.3,1)_.2s_both] [perspective:1400px]"
        >
          {/* aro tecnológico de fondo */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/15"
            style={{ transform: `translate(-50%,-50%) translate3d(${depth.x * -14}px, ${depth.y * -10}px, 0)` }}
            aria-hidden="true"
          >
            <div className="absolute inset-[9%] animate-spin-slow rounded-full border border-dashed border-blue/20" />
            <div className="absolute inset-[20%] rounded-full border border-white/[0.05]" />
          </div>

          {/* moto */}
          <div
            className="relative"
            style={{
              transform: `translate3d(${depth.x * 20}px, ${depth.y * 12 - scrolled * 0.06}px, 0) rotateY(${depth.x * -3}deg) rotateX(${depth.y * 2}deg)`,
              transition: 'transform .35s cubic-bezier(.22,1,.36,1)',
            }}
          >
            <div className="absolute inset-0 blur-2xl opacity-60" aria-hidden="true">
              <MotoArt variant="street" weight={9} className="w-full" />
            </div>
            <MotoArt
              variant="street"
              className="relative w-full drop-shadow-[0_28px_46px_rgba(0,0,0,0.75)]"
              title="Moto eléctrica H&D MOTORENS"
            />
          </div>

          {/* sombra de contacto en el piso */}
          <div
            className="pointer-events-none absolute inset-x-[12%] bottom-[13%] h-8 rounded-[50%] bg-blue/25 blur-2xl"
            aria-hidden="true"
          />

          {/* Etiquetas de datos, colocadas en el aire libre alrededor de la moto */}
          <FloatChip className="left-0 top-[1%]" delay={0.9} label="Batería" value="Grafeno" />
          <FloatChip
            className="right-0 top-[15%]"
            delay={1.1}
            label="Motor"
            value={`Hasta ${STATS.maxPower.toLocaleString('es-CO')}W`}
          />
          <FloatChip
            className="bottom-[-2%] right-[6%]"
            delay={1.3}
            label="Recarga"
            value="En casa, 110V"
          />
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(24px) } to { opacity:1; transform:none } }
        @keyframes hero-stage { from { opacity:0; transform: translateY(30px) scale(.96) } to { opacity:1; transform:none } }
        @keyframes chip-in { from { opacity:0; transform: translateY(14px) scale(.94) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}

function FloatChip({
  label,
  value,
  className = '',
  delay = 0,
}: {
  label: string
  value: string
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`absolute hidden animate-float rounded-xl border border-white/10 bg-steel/70 px-3.5 py-2.5 backdrop-blur-md sm:block ${className}`}
      style={{ animationDelay: `${delay}s` }}
      aria-hidden="true"
    >
      <div style={{ animation: `chip-in .6s cubic-bezier(.16,1,.3,1) ${delay}s both` }}>
        <p className="text-[9px] font-semibold uppercase tracking-widest2 text-cyan/80">{label}</p>
        <p className="mt-0.5 font-display text-sm font-bold text-chrome">{value}</p>
      </div>
    </div>
  )
}
