import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconArrow } from '@/components/art/Icons'
import { STATS } from '@/data/motos'
import { STATS_REPUESTOS } from '@/data/repuestos'
import { abrirCatalogo } from '@/lib/catalogo'

/**
 * Por qué H&D y cómo comprar.
 *
 * Antes eran cuatro tarjetas con promesas (asesoría, recarga en casa, sin
 * trámites) y un «proceso» con entrega, garantía y forma de pago que el
 * cliente nunca confirmó. Ahora son cifras que salen del propio catálogo y
 * los tres pasos que la web deja hacer de verdad.
 */
export default function Benefits() {
  const cifras = [
    { v: String(STATS.total), l: 'modelos eléctricos en el catálogo' },
    { v: `${STATS.maxRange} km`, l: 'de autonomía en el modelo de mayor alcance' },
    { v: String(STATS.withPrice), l: 'modelos con precio publicado' },
    { v: String(STATS_REPUESTOS.total), l: 'repuestos con referencia y precio' },
  ]

  const pasos = [
    { n: '01', t: 'Elige', d: 'Filtra el catálogo por tipo, precio, autonomía o velocidad.' },
    { n: '02', t: 'Escríbenos', d: 'Consulta por WhatsApp: el mensaje sale con el nombre del modelo.' },
    { n: '03', t: 'Resuelve', d: 'Pregunta por precio, colores y disponibilidad antes de decidir.' },
  ]

  return (
    <section id="nosotros" className="relative bg-paper py-16 sm:py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead
              tone="light"
              eyebrow="08 · Por qué H&D"
              title={
                <>
                  Menos gasto.
                  <br />
                  Más movimiento.
                </>
              }
              sub="Todo lo que ves en esta página sale del catálogo: modelos, cifras y precios reales."
            />
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/[0.08] bg-ink/[0.08] lg:col-span-7">
            {cifras.map((c, i) => (
              // La etiqueta va antes en el DOM (dt antes que dd) y se pinta debajo
              <Reveal key={c.l} delay={i * 70} className="flex flex-col-reverse bg-card p-5 sm:p-8">
                <dt className="mt-2 max-w-[22ch] text-[13px] leading-snug text-slate sm:text-[14px]">{c.l}</dt>
                <dd className="font-display text-[clamp(2.3rem,7vw,4.2rem)] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums]">
                  {c.v}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* Cómo comprar */}
        <div className="mt-14 border-t border-ink/[0.1] pt-10 sm:mt-20 sm:pt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <Reveal>
              <h3 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold uppercase leading-none text-ink">
                Cómo comprar
              </h3>
            </Reveal>
            <Reveal delay={80}>
              <button
                type="button"
                onClick={() => abrirCatalogo({})}
                className="group inline-flex min-h-[44px] items-center gap-2 text-[12px] font-bold uppercase tracking-widest2 text-ink transition-colors hover:text-blue-deep"
              >
                Empezar por el catálogo
                <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>

          <ol className="mt-8 grid gap-7 sm:grid-cols-3 sm:gap-8">
            {pasos.map((p, i) => (
              <Reveal as="li" key={p.n} delay={i * 90} className="relative">
                {/* Número decorativo: va en ::before para que no cuente como texto
                    (con ese contraste tan bajo fallaría la revisión de
                    accesibilidad); el orden ya lo da la lista numerada */}
                <span
                  data-n={p.n}
                  className="block font-display text-[3.6rem] font-extrabold leading-none text-ink/[0.08] before:content-[attr(data-n)]"
                  aria-hidden="true"
                />
                <h4 className="-mt-6 font-display text-[1.5rem] font-bold uppercase tracking-wide text-ink">{p.t}</h4>
                <p className="mt-2 max-w-[34ch] text-[14.5px] leading-relaxed text-slate">{p.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
