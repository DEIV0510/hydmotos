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
}: {
  eyebrow: string
  title: ReactNode
  sub?: string
  center?: boolean
}) {
  return (
    <header className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal>
        <span className="eyebrow">
          <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="mt-4 text-[clamp(2rem,6vw,3.6rem)] font-extrabold uppercase leading-[0.95] tracking-tight">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={170}>
          <p className="mt-4 text-[15px] leading-relaxed text-silver sm:text-base">{sub}</p>
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

const BASE =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold uppercase tracking-widest2 transition-all duration-300 min-h-[48px] px-7 text-[12.5px] focus-visible:outline-offset-4 active:scale-[0.97]'

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
