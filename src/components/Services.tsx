import { Reveal } from '@/components/ui/Primitives'
import { IconBattery, IconTools, IconWallet, IconShield } from '@/components/art/Icons'

/**
 * ✏️ EDITABLE: ajusta estos servicios a lo que realmente ofrece el negocio.
 * Se listan aquí y no dentro del JSX para que sea fácil cambiarlos.
 */
const SERVICES = [
  {
    Icon: IconWallet,
    title: 'Venta de motos eléctricas',
    text: 'Asesoría para elegir el modelo según tu recorrido diario.',
  },
  {
    Icon: IconBattery,
    title: 'Baterías y repuestos',
    text: 'Baterías de grafeno y litio, cargadores y componentes.',
  },
  {
    Icon: IconTools,
    title: 'Mantenimiento',
    text: 'Frenos, sistema eléctrico y puesta a punto de tu moto.',
  },
  {
    Icon: IconShield,
    title: 'Garantía y respaldo',
    text: 'Acompañamiento después de la compra: dudas y ajustes.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="relative scroll-mt-20 bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">
              <span className="h-px w-7 bg-blue/50" aria-hidden="true" />
              Servicios
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-[clamp(1.7rem,4.5vw,2.4rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
              Te acompañamos después
            </h2>
          </Reveal>
        </div>

        <ul className="mt-8 grid gap-3 xs:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ Icon, title, text }, i) => (
            <Reveal as="li" key={title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-ink/[0.07] bg-card p-4 shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover sm:p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/[0.09] text-blue-deep transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3.5 font-display text-[1.05rem] font-bold uppercase leading-tight tracking-wide text-ink">
                  {title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate">{text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
