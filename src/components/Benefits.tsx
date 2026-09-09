import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconBolt, IconShield, IconWallet, IconHeadset } from '@/components/art/Icons'
import { STATS } from '@/data/motos'

const ITEMS = [
  {
    Icon: IconWallet,
    title: 'Cero gasolina',
    text: 'Se recargan en un tomacorriente común. Lo que gastabas en tanqueadas se queda en tu bolsillo.',
  },
  {
    Icon: IconShield,
    title: 'Sin trámites',
    text: 'La mayoría del catálogo no exige SOAT, matrícula ni tecnomecánica. Te la llevas y rodás.',
  },
  {
    Icon: IconBolt,
    title: 'Autonomía real',
    text: `Baterías de grafeno con hasta ${STATS.maxRange} km por carga. Alcanza de sobra para tu día completo.`,
  },
  {
    Icon: IconHeadset,
    title: 'Asesoría directa',
    text: 'Te ayudamos a elegir según tu recorrido diario, tu peso de carga y tu presupuesto.',
  },
]

export default function Benefits() {
  return (
    <section id="nosotros" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/[0.07] blur-[120px]" />
      </div>

      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHead
          eyebrow="Por qué H&D"
          title={
            <>
              Menos gasto.
              <br />
              Más movimiento.
            </>
          }
          sub="Cuatro razones por las que nuestros clientes cambian su moto de gasolina por una eléctrica."
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 90}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/[0.08] surface p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-cyan/30 hover:shadow-lift sm:p-7">
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue/15 blur-2xl transition-all duration-500 group-hover:bg-cyan/20"
                  aria-hidden="true"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/25 bg-cyan/10 text-cyan transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <h3 className="relative mt-5 font-display text-xl font-bold uppercase tracking-wide text-chrome">
                  {title}
                </h3>
                <p className="relative mt-2.5 text-[14.5px] leading-relaxed text-silver">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
