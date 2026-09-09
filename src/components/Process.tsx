import { Reveal } from '@/components/ui/Primitives'

const STEPS = [
  { n: '01', t: 'Elige', d: 'Explora el catálogo y filtra por autonomía, velocidad o precio.' },
  { n: '02', t: 'Cotiza', d: 'Escríbenos por WhatsApp con el modelo que te interesa.' },
  { n: '03', t: 'Asesoría', d: 'Resolvemos dudas de batería, carga, garantía y forma de pago.' },
  { n: '04', t: 'Rueda', d: 'Coordinamos la entrega y sales rodando en tu nueva eléctrica.' },
]

export default function Process() {
  return (
    <section className="relative bg-paper pt-14 sm:pt-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-widest2 text-blue-deep">
              <span className="h-px w-7 bg-blue/50" aria-hidden="true" />
              Proceso
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display text-[clamp(1.7rem,4.5vw,2.4rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
              Cuatro pasos y ya
            </h2>
          </Reveal>
        </div>

        <ol className="relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* línea que conecta los pasos en escritorio */}
          <span
            className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-blue/25 to-transparent lg:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className="relative">
              <div className="group">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-blue/25 bg-card font-display text-[15px] font-bold text-blue-deep shadow-card transition-all duration-500 group-hover:scale-110 group-hover:border-blue/60">
                  {s.n}
                </span>
                <h3 className="mt-3.5 font-display text-xl font-bold uppercase tracking-wide text-ink">
                  {s.t}
                </h3>
                <p className="mt-1.5 max-w-[30ch] text-[13.5px] leading-relaxed text-slate">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
