import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { IconArrow } from '@/components/art/Icons'

/* ---------------- Reveal: aparición escalonada al hacer scroll ---------------- */

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}: {
  children: ReactNode
  /** Retardo en ms para escalonar elementos hermanos */
  delay?: number
  as?: 'div' | 'li' | 'section' | 'header' | 'article'
  className?: string
}) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}

/* ---------------- Encabezado de sección ---------------- */

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
  tone = 'dark',
}: {
  eyebrow: string
  title: ReactNode
  sub?: string
  center?: boolean
  /** 'light' = sección de fondo claro */
  tone?: 'dark' | 'light'
}) {
  const light = tone === 'light'
  return (
    <header className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal>
        <span
          className={`inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest2 ${
            light ? 'text-blue' : 'text-cyan'
          }`}
        >
          <span className={`h-px w-7 ${light ? 'bg-blue' : 'bg-cyan'}`} aria-hidden="true" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={90}>
        <h2
          className={`mt-3.5 text-[clamp(1.9rem,5.4vw,3.2rem)] font-extrabold uppercase leading-[0.95] tracking-tight ${
            light ? 'text-ink' : 'text-chrome'
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={170}>
          <p className={`mt-3.5 text-[15px] leading-relaxed ${light ? 'text-slate' : 'text-silver'}`}>
            {sub}
          </p>
        </Reveal>
      )}
    </header>
  )
}

/* ---------------- Botones ---------------- */

type BtnProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  className?: string
  external?: boolean
  'aria-label'?: string
}

// En móvil, menos espaciado entre letras: con el de escritorio «Consultar por
// WhatsApp» se partía en dos líneas a 320 px y dentro de la tarjeta del cierre.
// Esquina pequeña, no píldora: una marca de movilidad/ingeniería lee como
// panel técnico, no como plantilla de e-commerce con todo en rounded-full.
const BASE =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-md text-center font-semibold uppercase tracking-[0.12em] sm:tracking-widest2 transition-all duration-300 min-h-[48px] px-5 sm:px-7 text-[12.5px] focus-visible:outline-offset-4 active:scale-[0.97]'

const VARIANTS = {
  // rojo con contraste AA sobre texto blanco; el brillo lo da el halo, no el fondo
  primary:
    'bg-red-btn text-white shadow-glow-red hover:bg-red hover:shadow-[0_14px_44px_-8px_rgba(255,34,51,0.8)] hover:-translate-y-0.5',
  outline:
    'border border-white/20 bg-white/[0.04] text-chrome backdrop-blur hover:border-cyan/60 hover:bg-white/[0.09] hover:-translate-y-0.5',
  ghost: 'text-chrome hover:text-cyan',
}

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  external,
  ...rest
}: BtnProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`
  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <IconArrow className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls} {...rest}>
      {inner}
    </button>
  )
}

/* ---------------- Fondo técnico reutilizable ---------------- */

export function TechBackdrop({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-grid-tech bg-grid opacity-[0.55]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-void to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-void to-transparent" />
    </div>
  )
}

/* ---------------- Marcas de esquina (lenguaje visual propio) ----------------
   Cuatro escuadras finas en las esquinas de una foto o panel, como el retículo
   de un visor. Referencia a instrumentación técnica sin llegar a HUD de
   videojuego: son cuatro trazos de 1px, nada más. Se usan con moderación —
   en el Hero, en la máquina destacada y poco más. */
export function TechFrame({
  tone = 'light',
  inset = 14,
  size = 22,
}: {
  /** 'light' = trazos claros (sobre fondo oscuro), 'dark' = trazos oscuros (sobre fondo claro) */
  tone?: 'light' | 'dark'
  inset?: number
  size?: number
}) {
  const color = tone === 'light' ? 'border-white/40' : 'border-ink/30'
  const corners = [
    { key: 'tl', pos: 'left-0 top-0', border: 'border-l border-t' },
    { key: 'tr', pos: 'right-0 top-0', border: 'border-r border-t' },
    { key: 'bl', pos: 'left-0 bottom-0', border: 'border-l border-b' },
    { key: 'br', pos: 'right-0 bottom-0', border: 'border-r border-b' },
  ]
  return (
    <div className="pointer-events-none absolute z-10" style={{ inset }} aria-hidden="true">
      {corners.map((c) => (
        <span
          key={c.key}
          className={`absolute ${c.pos} ${c.border} ${color}`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )
}

/* ---------------- Franja de datos (lectura tipo tablero) ----------------
   Fila de cifras con etiqueta, separadas por líneas finas y con numeración
   tabular — el mismo patrón que ya usaban el Hero y "Por qué H&D" a mano,
   ahora reutilizable donde haga falta una lectura de especificaciones. */
export function DataStrip({
  items,
  tone = 'light',
  size = 'md',
  className = '',
}: {
  items: { v: string; l: string }[]
  tone?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dark = tone === 'dark'
  const valueSize = {
    sm: 'text-[1.05rem] sm:text-[1.2rem]',
    md: 'text-[clamp(1.15rem,3.6vw,1.6rem)]',
    lg: 'text-[clamp(1.6rem,4.4vw,2.5rem)]',
  }[size]
  return (
    <dl className={`grid auto-cols-fr grid-flow-col divide-x ${dark ? 'divide-ink/10' : 'divide-white/[0.14]'} ${className}`}>
      {items.map((c) => (
        <div key={c.l} className="flex flex-col-reverse pr-4 first:pl-0 [&:not(:first-child)]:pl-4">
          <dt className={`mt-1.5 text-[10px] font-semibold uppercase tracking-widest2 ${dark ? 'text-slate' : 'text-silver'}`}>
            {c.l}
          </dt>
          <dd
            className={`font-display font-bold leading-none [font-variant-numeric:tabular-nums] ${valueSize} ${dark ? 'text-ink' : 'text-chrome'}`}
          >
            {c.v}
          </dd>
        </div>
      ))}
    </dl>
  )
}
