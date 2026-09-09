import { useId } from 'react'

/**
 * Wordmark H&D MOTORENS.
 * Construido con tipografía + un monograma vectorial: la "H" y la "D"
 * separadas por un ampersand rojo, con una barra de energía que cruza
 * el conjunto. No hay logo original del cliente; este es el sistema
 * propuesto y se reemplaza cambiando solo este componente.
 */

export function LogoMark({ className = '', size = 40 }: { className?: string; size?: number }) {
  const uid = useId().replace(/:/g, '')
  const g = `lg-${uid}`
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DF0FF" />
          <stop offset=".55" stopColor="#2E7BFF" />
          <stop offset="1" stopColor="#1140C8" />
        </linearGradient>
      </defs>
      {/* placa hexagonal */}
      <path
        d="M32 3 L56 16.5 V47.5 L32 61 L8 47.5 V16.5 Z"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* H */}
      <path d="M19 21 V43 M19 32 H30 M30 21 V43" stroke="#E6ECF4" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* D */}
      <path
        d="M38 21 H43 a10 11 0 0 1 0 22 H38 Z"
        fill="none"
        stroke="#E6ECF4"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* barra de energía */}
      <path d="M12 51 H52" stroke="#FF2233" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={compact ? 32 : 38} className="shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[19px] font-extrabold tracking-wide text-chrome sm:text-[21px]">
          H<span className="text-red">&amp;</span>D
          <span className="ml-1.5 font-bold text-chrome/90">MOTORENS</span>
        </span>
        {!compact && (
          <span className="mt-[3px] text-[8.5px] font-semibold uppercase tracking-widest3 text-cyan/80">
            Movilidad eléctrica
          </span>
        )}
      </span>
    </span>
  )
}
