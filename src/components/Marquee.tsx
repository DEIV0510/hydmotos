import { STATS } from '@/data/motos'
import { STATS_REPUESTOS } from '@/data/repuestos'

/**
 * Franja de datos en movimiento continuo.
 * El contenido se duplica para que el bucle no tenga costura;
 * la copia extra queda oculta a lectores de pantalla.
 *
 * Solo datos comprobables en la propia web. «Recarga en casa» se quitó: nadie
 * lo confirmó y depende de cada modelo.
 */
export default function Marquee() {
  const items = [
    'Cero gasolina',
    `Hasta ${STATS.maxRange} km de autonomía`,
    'Modelos sin SOAT ni matrícula',
    'Baterías de grafeno y litio',
    `${STATS.total} modelos`,
    `${STATS_REPUESTOS.total} repuestos`,
    'Consulta por WhatsApp',
  ]

  return (
    <div
      className="relative flex overflow-hidden border-y border-white/[0.07] bg-void py-4"
      role="region"
      aria-label="Resumen de H&D MOTORENS"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void to-transparent sm:w-28" />

      {[0, 1].map((copy) => (
        <ul
          key={copy}
          className="flex shrink-0 animate-marquee items-center gap-10 pr-10 motion-reduce:animate-none sm:gap-14 sm:pr-14"
          aria-hidden={copy === 1 ? 'true' : undefined}
        >
          {items.map((t) => (
            <li
              key={t}
              className="flex shrink-0 items-center gap-4 text-[12px] font-semibold uppercase tracking-widest2 text-silver/75 sm:text-[13px]"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-red" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}
