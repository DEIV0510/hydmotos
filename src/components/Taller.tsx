import { Button, Reveal } from '@/components/ui/Primitives'
import { IconBolt, IconTools, IconWhatsApp } from '@/components/art/Icons'
import { abrirRepuestos } from '@/lib/catalogo'
import { photoOfPartLive, useRepuestosVivo, type RepuestoConEstado } from '@/lib/repuestos-live'
import { useWa } from '@/lib/wa'

const WA_TALLER =
  'Hola, necesito el taller de H&D MOTORENS para mi vehículo eléctrico. ¿Me pueden ayudar?'

/** Piezas con foto limpia para la composición: controlador, disco de freno y llanta */
const MUESTRA = ['RKCT026', 'RKFR027', 'RKCZ004']

/**
 * Taller y servicios. El cliente lo pidió en el menú (nota de voz del 15/09) y
 * va a mandar qué trabajos hace. Hasta entonces la sección no enumera servicios
 * concretos (diagnóstico, mantenimiento…): presenta el taller, lo conecta con
 * los repuestos, que sí están en la web, y lleva a WhatsApp.
 */
export default function Taller() {
  const { waLink, waReady } = useWa()
  // De los publicados: si el cliente oculta una de estas piezas, sale también de aquí
  const { repuestos, stats } = useRepuestosVivo()
  const piezas = MUESTRA.map((sku) => repuestos.find((r) => r.sku === sku)).filter(
    (r): r is RepuestoConEstado => Boolean(r && photoOfPartLive(r)),
  )
  const puntos = [
    { Icon: IconTools, t: 'Motos, patinetas y carros eléctricos', d: 'Cuéntanos qué vehículo tienes y qué necesita.' },
    { Icon: IconBolt, t: `${stats.total} repuestos en la web`, d: 'Por nombre o referencia, para ubicar la pieza que buscas.' },
    { Icon: IconWhatsApp, t: 'Atención por WhatsApp', d: 'Escríbenos y te orientamos por ahí.' },
  ]

  return (
    <section id="taller" className="relative bg-graphite py-16 sm:py-24">
      <div className="mx-auto grid max-w-content items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-7 bg-cyan" aria-hidden="true" />
              06 · Taller
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
              Taller y
              <br />
              servicios
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
              Servicio técnico para tu vehículo eléctrico, con los repuestos a la mano.
            </p>
          </Reveal>

          <Reveal delay={230}>
            <ul className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {puntos.map(({ Icon, t, d }) => (
                <li key={t} className="flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-chrome">{t}</span>
                    <span className="block text-[13.5px] text-silver">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={waLink(WA_TALLER)} external={waReady}>
                Consultar por WhatsApp
              </Button>
              <Button variant="outline" onClick={() => abrirRepuestos({})}>
                Ver repuestos
              </Button>
            </div>
          </Reveal>
        </div>

        {piezas.length > 0 && (
          <Reveal delay={140}>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4" aria-label="Algunos repuestos de la tienda">
              {piezas.map((p, i) => {
                const foto = photoOfPartLive(p)
                if (!foto) return null
                return (
                  <li
                    key={p.id}
                    className={`overflow-hidden rounded-2xl border border-cyan/20 bg-white shadow-lift ${
                      i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={foto.src2x}
                      alt={p.name}
                      width={720}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain p-4"
                    />
                  </li>
                )
              })}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
