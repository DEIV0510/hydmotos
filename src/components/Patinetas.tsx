import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconArrow, IconWhatsApp } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { REPUESTOS, photoOfPart } from '@/data/repuestos'
import { abrirRepuestos } from '@/lib/catalogo'
import { waLink, waReady } from '@/lib/wa'

const WA_PATINETAS =
  'Hola, quiero comprar una patineta eléctrica en H&D MOTORENS. ¿Qué modelos tienen disponibles y a qué precio?'

/**
 * Patinetas eléctricas. El cliente las pidió como categoría del menú (notas de
 * voz del 11 y el 15/09), pero en el material todavía no hay ningún modelo: ni
 * fotos, ni nombres, ni precios. La sección no inventa ninguno: invita a
 * preguntar por los disponibles y enseña lo que sí existe, los repuestos para
 * patineta del catálogo, con su foto y su precio.
 */
export default function Patinetas() {
  const repuestos = REPUESTOS.filter((r) => /patineta/i.test(r.name))
  const conFoto = repuestos.filter((r) => photoOfPart(r)).slice(0, 6)

  return (
    <section id="patinetas" className="relative bg-paper py-14 sm:py-20">
      <div className="mx-auto grid max-w-content gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead
            tone="light"
            eyebrow="04 · Patinetas"
            title={
              <>
                Patinetas
                <br />
                eléctricas
              </>
            }
            sub="Estamos subiendo los modelos a la web. Escríbenos y te contamos cuáles hay disponibles y a qué precio."
          />
          <Reveal delay={220}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={waLink(WA_PATINETAS)}
                target={waReady ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-blue px-7 text-[12.5px] font-bold uppercase tracking-widest2 text-white shadow-glow-blue transition-colors duration-300 hover:bg-blue-deep"
              >
                <IconWhatsApp className="h-4 w-4" />
                Comprar por WhatsApp
              </a>
              {repuestos.length > 0 && (
                <button
                  type="button"
                  onClick={() => abrirRepuestos({ q: 'patineta' })}
                  className="group inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-ink/15 bg-card px-6 text-[12px] font-bold uppercase tracking-widest2 text-ink transition-colors duration-300 hover:border-blue/40 hover:text-blue-deep"
                >
                  Repuestos para patineta
                  <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {conFoto.length > 0 && (
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-widest2 text-slate">
                Repuestos para patineta en la tienda
              </p>
            </Reveal>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {conFoto.map((r, i) => {
                const foto = photoOfPart(r)
                if (!foto) return null
                return (
                  <Reveal as="li" key={r.id} delay={i * 60} className="h-full">
                    <button
                      type="button"
                      onClick={() => abrirRepuestos({ q: r.sku ?? r.name })}
                      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-card text-left shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover"
                    >
                      <span className="block aspect-square bg-white">
                        <img
                          src={foto.src}
                          srcSet={foto.srcSet}
                          sizes="(min-width: 1024px) 220px, 45vw"
                          alt=""
                          width={360}
                          height={360}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                        />
                      </span>
                      <span className="flex flex-1 flex-col p-3 sm:p-4">
                        <span className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink">{r.name}</span>
                        {r.price ? (
                          <span className="mt-auto pt-2 font-display text-[1.1rem] font-extrabold leading-none text-ink [font-variant-numeric:tabular-nums]">
                            {formatCOP(r.price)}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </Reveal>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
