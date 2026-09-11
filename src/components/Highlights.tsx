import { useMemo } from 'react'
import { Reveal } from '@/components/ui/Primitives'
import { MOTOS, formatCOP, photoOf, type Moto } from '@/data/motos'
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
      { key: 'autonomia', Icon: IconRoute, label: 'Mayor autonomía', by: (m: Moto) => m.range ?? 0, stat: (m: Moto) => `${m.range} km` },
      { key: 'velocidad', Icon: IconGauge, label: 'Mayor velocidad', by: (m: Moto) => m.speed ?? 0, stat: (m: Moto) => `${m.speed} km/h` },
      { key: 'potencia', Icon: IconBolt, label: 'Mayor potencia', by: (m: Moto) => m.power ?? 0, stat: (m: Moto) => `${(m.power ?? 0).toLocaleString('es-CO')}W` },
      { key: 'precio', Icon: IconWallet, label: 'Mejor precio', by: (m: Moto) => -(m.price ?? Infinity), stat: (m: Moto) => (m.price ? formatCOP(m.price) : 'Consultar') },
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
    <section className="relative bg-paper pb-14 sm:pb-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">
            <span className="h-px w-7 bg-blue/50" aria-hidden="true" />
            Lo más buscado
          </span>
        </Reveal>

        <ul className="mt-5 grid gap-3 xs:grid-cols-2 xl:grid-cols-4">
          {picks.map(({ key, Icon, label, moto, stat }, i) => {
            const wa = waLink(waForMoto(moto.name))
            const foto = photoOf(moto)
            return (
              <Reveal as="li" key={key} delay={i * 70}>
                <a
                  href={wa}
                  target={wa.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex h-full items-center gap-3 rounded-2xl border border-ink/[0.07] bg-card p-3 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover"
                >
                  {/*
                    Sin foto no se pone nada: el campeón de cada criterio sale
                    del dato real, y varios de ellos aún no tienen foto. Cuatro
                    recuadros de "foto pendiente" seguidos parecen un error, y
                    elegir otro modelo solo por tener foto haría falso el
                    titular. La tarjeta funciona igual con el dato solo.
                  */}
                  {foto && (
                    <div className="relative w-20 shrink-0 sm:w-24">
                      <div
                        className="absolute inset-0 rounded-full bg-blue/[0.12] blur-lg transition-all duration-500 group-hover:bg-blue/10"
                        aria-hidden="true"
                      />
                      <img
                        src={foto.src}
                        srcSet={foto.srcSet}
                        sizes="96px"
                        alt={`Moto eléctrica ${moto.name}`}
                        width={450}
                        height={450}
                        loading="lazy"
                        decoding="async"
                        className={`relative aspect-square w-full transition-transform duration-700 group-hover:scale-110 ${
                          moto.photoFit === 'cover' ? 'rounded-xl object-cover' : 'object-contain'
                        }`}
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </p>
                    <p className="mt-1 truncate font-display text-[17px] font-bold uppercase leading-none text-ink">
                      {moto.name}
                    </p>
                    <p className="mt-1 font-display text-[14px] font-bold text-blue-deep [font-variant-numeric:tabular-nums]">
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
