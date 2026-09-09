import { useMemo } from 'react'
import MotoArt from '@/components/art/MotoArt'
import { Reveal } from '@/components/ui/Primitives'
import { MOTOS, formatCOP, type Moto } from '@/data/motos'
import { IconRoute, IconGauge, IconBolt, IconWallet } from '@/components/art/Icons'
import { waLink, waForMoto } from '@/lib/wa'

/**
 * Destacados del catálogo.
 * Nada está escrito a mano: cada campeón se calcula sobre MOTOS, así que
 * al agregar o cambiar un modelo esta sección se actualiza sola.
 */
export default function Highlights() {
  const picks = useMemo(() => {
    const criteria = [
      { key: 'autonomia', Icon: IconRoute, label: 'Mayor autonomía', by: (m: Moto) => m.range, stat: (m: Moto) => `${m.range} km` },
      { key: 'velocidad', Icon: IconGauge, label: 'Mayor velocidad', by: (m: Moto) => m.speed, stat: (m: Moto) => `${m.speed} km/h` },
      { key: 'potencia', Icon: IconBolt, label: 'Mayor potencia', by: (m: Moto) => m.power, stat: (m: Moto) => `${m.power.toLocaleString('es-CO')}W` },
      { key: 'precio', Icon: IconWallet, label: 'Mejor precio', by: (m: Moto) => -m.price, stat: (m: Moto) => formatCOP(m.price) },
    ]

    // Una moto por criterio: si ya ganó antes, cede el puesto a la siguiente
    // mejor. Así los cuatro destacados son siempre modelos distintos.
    const taken = new Set<string>()
    return criteria.map(({ key, Icon, label, by, stat }) => {
      const moto = MOTOS.filter((m) => !taken.has(m.id)).reduce((a, b) => (by(b) > by(a) ? b : a))
      taken.add(moto.id)
      return { key, Icon, label, moto, stat }
    })
  }, [])

  return (
    <section className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
            Lo más buscado
          </span>
        </Reveal>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {picks.map(({ key, Icon, label, moto, stat }, i) => {
            const wa = waLink(waForMoto(moto.name))
            return (
              <Reveal as="li" key={key} delay={i * 80}>
                <a
                  href={wa}
                  target={wa.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.08] surface p-4 transition-all duration-500 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-lift"
                >
                  <div className="relative w-24 shrink-0 sm:w-28">
                    <div
                      className="absolute inset-0 rounded-full bg-blue/20 blur-xl transition-all duration-500 group-hover:bg-cyan/25"
                      aria-hidden="true"
                    />
                    <MotoArt
                      variant={moto.art}
                      weight={9}
                      className="relative w-full transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-widest2 text-cyan/80">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </p>
                    <p className="mt-1 truncate font-display text-lg font-bold uppercase leading-none text-chrome">
                      {moto.name}
                    </p>
                    <p className="mt-1.5 font-display text-[15px] font-bold text-cyan [font-variant-numeric:tabular-nums]">
                      {stat(moto)}
                    </p>
                  </div>
                </a>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
