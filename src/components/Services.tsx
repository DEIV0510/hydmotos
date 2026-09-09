import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconBattery, IconTools, IconWallet, IconShield } from '@/components/art/Icons'

/**
 * ✏️ EDITABLE: ajusta estos servicios a lo que realmente ofrece el negocio.
 * Se listan aquí y no dentro del JSX para que sea fácil cambiarlos.
 */
const SERVICES = [
  {
    Icon: IconWallet,
    title: 'Venta de motos eléctricas',
    text: 'Catálogo completo con asesoría para elegir el modelo según tu recorrido diario.',
  },
  {
    Icon: IconBattery,
    title: 'Baterías y repuestos',
    text: 'Baterías de grafeno y litio, cargadores y componentes para tu eléctrica.',
  },
  {
    Icon: IconTools,
    title: 'Mantenimiento',
    text: 'Revisión de frenos, sistema eléctrico y puesta a punto de tu moto.',
  },
  {
    Icon: IconShield,
    title: 'Garantía y respaldo',
    text: 'Acompañamiento después de la compra: dudas, ajustes y soporte.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <SectionHead
            eyebrow="Servicios"
            title={
              <>
                Te acompañamos
                <br />
                después
              </>
            }
            sub="No solo vendemos la moto: seguimos ahí cuando la necesitas."
          />

          <ul className="grid gap-3 sm:grid-cols-2">
            {SERVICES.map(({ Icon, title, text }, i) => (
              <Reveal as="li" key={title} delay={i * 85}>
                <div className="group flex h-full gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-500 hover:border-cyan/25 hover:bg-white/[0.045]">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-void/60 text-cyan transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.05rem] font-bold uppercase leading-tight tracking-wide text-chrome">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-silver">{text}</p>
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
