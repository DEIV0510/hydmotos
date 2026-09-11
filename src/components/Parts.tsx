import { Reveal, SectionHead } from '@/components/ui/Primitives'
import {
  IconBattery,
  IconPlug,
  IconTire,
  IconBrake,
  IconShock,
  IconLight,
  IconDash,
  IconTools,
  IconWhatsApp,
} from '@/components/art/Icons'
import { REPUESTOS, type Repuesto } from '@/data/repuestos'
import { waLink } from '@/lib/wa'

const ICONOS = {
  battery: IconBattery,
  plug: IconPlug,
  tire: IconTire,
  brake: IconBrake,
  shock: IconShock,
  light: IconLight,
  dash: IconDash,
  tools: IconTools,
} as const

const mensaje = (r: Repuesto) =>
  `Hola, necesito ${r.name.toLowerCase()} para mi moto eléctrica. ¿Qué opciones tienen en H&D MOTORENS?`

export default function Parts() {
  return (
    <section id="repuestos" className="relative scroll-mt-20 bg-paper2 py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            tone="light"
            eyebrow="Repuestos"
            title={
              <>
                Todo para tu
                <br />
                eléctrica
              </>
            }
            sub="Baterías, cargadores, llantas y accesorios para los modelos que vendemos. Dinos qué necesitas y te cotizamos."
          />
          <Reveal delay={120}>
            <a
              href={waLink(
                'Hola, necesito un repuesto para mi moto eléctrica. ¿Me ayudan a cotizarlo en H&D MOTORENS?',
              )}
              target={waLink('x').startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2.5 rounded-full bg-ink px-7 text-[12px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-btn hover:shadow-glow-red active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              Pedir repuesto
            </a>
          </Reveal>
        </div>

        <ul className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {REPUESTOS.map((r, i) => {
            const Icon = ICONOS[r.icon]
            const wa = waLink(mensaje(r))
            return (
              <Reveal as="li" key={r.id} delay={Math.min(i, 5) * 60} className="h-full">
                <a
                  href={wa}
                  target={wa.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl border border-ink/[0.07] bg-card p-4 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover sm:p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue/[0.09] text-blue-deep transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-[21px] w-[21px]" />
                  </span>

                  <h3 className="mt-3.5 font-display text-[1.05rem] font-bold uppercase leading-tight tracking-wide text-ink sm:text-[1.15rem]">
                    {r.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate">{r.text}</p>

                  <ul className="mt-3.5 flex flex-wrap gap-1.5">
                    {r.specs.map((s) => (
                      <li
                        key={s}
                        className="rounded-md bg-paper2 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>

                  <span className="mt-auto pt-4 text-[11px] font-bold uppercase tracking-widest2 text-blue-deep">
                    Cotizar →
                  </span>
                </a>
              </Reveal>
            )
          })}
        </ul>

        <Reveal delay={160}>
          <p className="mt-7 text-[13px] text-slate">
            ¿No ves lo que buscas? Escríbenos con la referencia o una foto de la pieza y te decimos
            si la tenemos.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
