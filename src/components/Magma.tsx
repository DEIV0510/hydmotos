import { Reveal } from '@/components/ui/Primitives'
import { IconArrow, IconWhatsApp } from '@/components/art/Icons'
import { MAGMA, type Media } from '@/data/media'
import type { Moto } from '@/data/motos'
import { abrirCatalogo } from '@/lib/catalogo'
import { useCatalogoVivo } from '@/lib/motos-live'
import { useWa } from '@/lib/wa'

const WA_MAGMA = 'Hola, quiero información sobre los modelos MAGMA de H&D MOTORENS.'

const pieza = (id: string) => MAGMA.find((m) => m.id === id) as Media

/** "PORTIVA – MAGMA" → "PORTIVA", "MAGMA Q2 BOXTER" → "Q2 BOXTER" */
const sinMarca = (nombre: string) =>
  nombre
    .replace(/\bMAGMA\b/i, '')
    .replace(/^\s*[–-]\s*|\s*[–-]\s*$/g, '')
    .trim()

/**
 * Modelos MAGMA: los que llevan la marca en el nombre y los que su ficha
 * presenta como MAGMA (la de ÁGUILA dice «Moto Eléctrica ÁGUILA MAGMA»). Es el
 * mismo texto en el que busca el catálogo, así que «Ver modelos MAGMA» enseña
 * exactamente los de esta lista.
 */
const esMagma = (m: Moto) => /\bmagma\b/i.test(`${m.name} ${m.brand ?? ''} ${m.description ?? ''}`)

/** Búsqueda que deja solo ese modelo: «ÁGUILA» sola traería también ÁGUILA PRO MAX */
const busquedaDe = (m: Moto) => (/\bmagma\b/i.test(m.name) ? m.name : `${m.name} MAGMA`)

/**
 * MAGMA es la marca con más material propio en la carpeta Motors: un banner,
 * cinco piezas informativas y fotos de detalle. Se presenta como marca, con
 * acceso directo a sus modelos del catálogo.
 *
 * Las cifras que salen en esas piezas (ciclos de batería, garantía de motor)
 * son de MAGMA y se muestran dentro de sus propias imágenes, tal cual; la
 * tienda no las repite como promesa suya.
 */
export default function Magma() {
  const { waLink, waReady } = useWa()
  const banner = pieza('bubble-faro')
  const { motos: MOTOS } = useCatalogoVivo()
  const modelos = MOTOS.filter(esMagma)
  const bubble = modelos.find((m) => m.id === 'magma-bubble')
  const wa = waLink(WA_MAGMA)

  return (
    <section id="magma" className="relative overflow-hidden bg-graphite py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-blue/[0.08] blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Banner */}
          <Reveal className="lg:col-span-7">
            <figure className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-void">
              <img
                src={banner.src}
                srcSet={banner.srcSet}
                sizes="(min-width: 1024px) 700px, 92vw"
                width={banner.width}
                height={banner.height}
                alt={banner.alt}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-void/90 via-void/40 to-transparent p-5 pt-24 sm:p-7 sm:pt-28">
                <span>
                  <span className="block text-[10.5px] font-semibold uppercase tracking-widest2 text-cyan">MAGMA</span>
                  <span className="mt-1 block font-display text-[1.9rem] font-bold uppercase leading-none text-chrome sm:text-[2.3rem]">
                    Bubble
                  </span>
                </span>
                {bubble && (
                  <button
                    type="button"
                    onClick={() => abrirCatalogo({ q: bubble.name })}
                    className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md border border-white/20 bg-void/50 px-4 text-[11px] font-bold uppercase tracking-widest2 text-chrome backdrop-blur transition-colors hover:border-white/45"
                  >
                    Ver modelo
                    <IconArrow className="h-3.5 w-3.5" />
                  </button>
                )}
              </figcaption>
            </figure>
          </Reveal>

          {/* Texto */}
          <div className="lg:col-span-5">
            <Reveal>
              <span className="eyebrow">
                <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
                03 · Marca
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
                MAGMA
                <br />
                en H&amp;D
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
                Scooters y motos eléctricas de la marca, con su material oficial.{' '}
                {modelos.length} {modelos.length === 1 ? 'modelo' : 'modelos'} en el catálogo:
              </p>
            </Reveal>
            <Reveal delay={210}>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Modelos MAGMA en el catálogo">
                {modelos.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => abrirCatalogo({ q: busquedaDe(m) })}
                      className="inline-flex min-h-[44px] items-center rounded-md border border-white/12 bg-white/[0.03] px-4 text-[11.5px] font-semibold uppercase tracking-widest2 text-chrome transition-colors hover:border-cyan/50 hover:text-cyan"
                    >
                      {sinMarca(m.name)}
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={270}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={() => abrirCatalogo({ q: 'magma' })}
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-md bg-chrome px-7 text-[12.5px] font-bold uppercase tracking-widest2 text-void transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  Ver modelos MAGMA
                  <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <a
                  href={wa}
                  target={waReady ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-md border border-white/20 px-7 text-[12.5px] font-semibold uppercase tracking-widest2 text-chrome transition-colors duration-300 hover:border-cyan/60"
                >
                  <IconWhatsApp className="h-4 w-4" />
                  Consultar
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
