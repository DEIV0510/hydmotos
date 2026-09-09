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
    <section id="nosotros" className="relative scroll-mt-20 bg-paper2 py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-14">
          <SectionHead
            tone="light"
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

          <ul className="grid gap-3 sm:grid-cols-2">
            {ITEMS.map(({ Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 80}>
                <div className="group flex h-full gap-3.5 rounded-2xl border border-ink/[0.07] bg-card p-4 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover sm:p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue/[0.09] text-blue-deep transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-[21px] w-[21px]" />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.15rem] font-bold uppercase leading-tight tracking-wide text-ink">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
