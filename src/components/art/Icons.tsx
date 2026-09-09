/**
 * Set de iconos propio, trazo 1.75 y caja 24 para todo el sitio.
 * SVG en lugar de emoji: escalan, heredan color y se mantienen
 * consistentes entre plataformas.
 */
type P = { className?: string }

const S = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
}

export const IconBolt = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
  </svg>
)

export const IconBattery = ({ className }: P) => (
  <svg {...S} className={className}>
    <rect x="2" y="7" width="16" height="10" rx="2.5" />
    <path d="M21 10.5v3M9.5 10l-1.5 2.5h2L9 15" />
  </svg>
)

export const IconGauge = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M3.5 18a9 9 0 1 1 17 0" />
    <path d="M12 14.5 16 10" />
    <circle cx="12" cy="15.5" r="1.4" />
  </svg>
)

export const IconRoute = ({ className }: P) => (
  <svg {...S} className={className}>
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="5.5" r="2.5" />
    <path d="M8 18.5h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6" />
  </svg>
)

export const IconShield = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M12 2.5 20 6v6c0 4.5-3.2 8.4-8 9.5-4.8-1.1-8-5-8-9.5V6l8-3.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const IconWallet = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <circle cx="16.5" cy="13.5" r="1.2" />
  </svg>
)

export const IconHeadset = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <path d="M4 14h1.5a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 5.5 19H4Zm16 0h-1.5a1.5 1.5 0 0 0-1.5 1.5v2a1.5 1.5 0 0 0 1.5 1.5H20Z" />
  </svg>
)

export const IconTools = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M14.5 4.5a4 4 0 0 0 5 5L21 8v6l-7 7-4-4 7-7-1.5-1.5Z" />
    <path d="m8 12-5 5 3 3 5-5" />
  </svg>
)

export const IconSearch = ({ className }: P) => (
  <svg {...S} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconClose = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
)

export const IconArrow = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

export const IconChevron = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconPin = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const IconClock = ({ className }: P) => (
  <svg {...S} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </svg>
)

export const IconPhone = ({ className }: P) => (
  <svg {...S} className={className}>
    <path d="M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2L21 14.5v3a2.5 2.5 0 0 1-2.7 2.5A16.5 16.5 0 0 1 3.5 5.7 2.5 2.5 0 0 1 6 3Z" />
  </svg>
)

export const IconMail = ({ className }: P) => (
  <svg {...S} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

export const IconWhatsApp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
    <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.88 9.88 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.24 8.24 0 0 1-1.26-4.36c0-4.56 3.71-8.27 8.28-8.27 2.21 0 4.28.86 5.84 2.43a8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.2-8.3 8.2Zm4.53-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12s-.64.8-.79.97c-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.59 4.11 3.63.58.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
  </svg>
)
