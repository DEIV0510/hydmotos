import { Reveal, SectionHead } from '@/components/ui/Primitives'

const STEPS = [
  { n: '01', t: 'Elige', d: 'Explora el catálogo y filtra por autonomía, velocidad o precio.' },
  { n: '02', t: 'Cotiza', d: 'Escríbenos por WhatsApp con el modelo que te interesa.' },
  { n: '03', t: 'Asesoría', d: 'Resolvemos dudas de batería, carga, garantía y forma de pago.' },
  { n: '04', t: 'Rueda', d: 'Coordinamos la entrega y sales rodando en tu nueva eléctrica.' },
]

export default function Process() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHead
          eyebrow="Proceso"
          title={<>Cuatro pasos y ya</>}
          sub="Sin vueltas ni papeleo innecesario."
        />

        <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {/* línea que conecta los pasos en escritorio */}
          <span
            className="pointer-events-none absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent lg:block"
            aria-hidden="true"
          />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 110} className="relative">
              <div className="group">
                <span className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-cyan/25 bg-graphite font-display text-lg font-bold text-cyan transition-all duration-500 group-hover:scale-110 group-hover:border-cyan/60 group-hover:shadow-glow-cyan">
                  {s.n}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold uppercase tracking-wide text-chrome">
                  {s.t}
                </h3>
                <p className="mt-2 max-w-[26ch] text-[14.5px] leading-relaxed text-silver">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
