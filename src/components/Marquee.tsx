import { STATS } from '@/data/motos'
import { STATS_REPUESTOS } from '@/data/repuestos'

/**
 * Franja de datos en movimiento continuo, en el azul eléctrico de la marca.
 * El contenido se duplica para que el bucle no tenga costura; la copia extra
 * queda oculta a lectores de pantalla.
 *
 * Solo lo que la tienda ofrece de verdad: sus categorías (motos, patinetas,
 * carros eléctricos, taller y repuestos, según el cliente) y datos del
 * catálogo. «Recarga en casa» se quitó: nadie lo confirmó.
 */
export default function Marquee() {
  const items = [
    'Motos eléctricas',
    'Patinetas eléctricas',
    'Carros eléctricos',
    'Taller',
    `${STATS_REPUESTOS.total} repuestos`,
    `Hasta ${STATS.maxRange} km de autonomía`,
    'Modelos sin SOAT ni matrícula',
    'Cero gasolina',
  ]

  return (
    <div
      className="relative flex overflow-hidden border-y border-white/10 bg-gradient-to-r from-blue-deep via-blue to-blue-deep py-4"
      role="region"
      aria-label="Resumen de H&D MOTORENS"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-blue-deep to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-blue-deep to-transparent sm:w-28" />

      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className="flex shrink-0 animate-marquee items-center gap-10 pr-10 motion-reduce:animate-none sm:gap-14 sm:pr-14"
          aria-hidden={copy === 1 ? 'true' : undefined}
        >
          {items.map((t) => (
            <li
              key={t}
              className="flex shrink-0 items-center gap-4 text-[12px] font-semibold uppercase tracking-widest2 text-white sm:text-[13px]"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-white/70" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
