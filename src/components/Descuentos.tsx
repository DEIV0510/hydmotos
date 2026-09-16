import { Button, Reveal } from '@/components/ui/Primitives'
import { IconArrow } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { REPUESTOS } from '@/data/repuestos'
import { VIDEOS_PROMO, type VideoPromo } from '@/data/promos'
import { abrirCatalogo, abrirRepuestos } from '@/lib/catalogo'
import { useCatalogoVivo } from '@/lib/motos-live'
import { waLink, waReady } from '@/lib/wa'

const WA_DESCUENTOS = 'Hola, quiero comprar con descuento en H&D MOTORENS. ¿Qué ofertas tienen ahora?'

const rebaja = (precio: number, anterior: number) => Math.round(((anterior - precio) / anterior) * 100)

/**
 * Banner de descuentos, a lo ancho y arriba en la página, como lo pidió el
 * cliente (nota de voz del 15/09): letras en 3D, bien llamativo y con sitio
 * para videos que sirvan de gancho para la venta.
 *
 * Ninguna oferta es inventada: salen del catálogo (los modelos con precio
 * anterior en la lista del cliente y los repuestos marcados en oferta en el
 * Excel). Los videos se configuran en src/data/promos.ts; sin videos no hay
 * reproductor.
 */
export default function Descuentos() {
  const { motos: MOTOS } = useCatalogoVivo()
  const motos = MOTOS.filter((m) => m.price && m.oldPrice)
    .map((m) => ({ id: m.id, nombre: m.name, precio: m.price as number, anterior: m.oldPrice as number }))
    .sort((a, b) => rebaja(b.precio, b.anterior) - rebaja(a.precio, a.anterior))
  const repuestos = REPUESTOS.filter((r) => r.price && r.oldPrice)
  const maxMotos = motos.length ? rebaja(motos[0].precio, motos[0].anterior) : 0
  const maxRepuestos = repuestos.reduce(
    (max, r) => Math.max(max, rebaja(r.price as number, r.oldPrice as number)),
    0,
  )
  const video: VideoPromo | undefined = VIDEOS_PROMO[0]
  const reducido =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!motos.length && !repuestos.length) return null

  return (
    <section
      id="descuentos"
      aria-labelledby="titulo-descuentos"
      className="relative isolate overflow-hidden bg-void py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,#0B0D11_0%,#0C1A3F_50%,#123C99_100%)]" />
        <div className="absolute inset-0 bg-grid-tech bg-grid opacity-80" />
        <div className="absolute -right-32 top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-cyan/20 blur-[130px]" />
      </div>

      <div className="mx-auto grid max-w-content items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-7 bg-cyan" aria-hidden="true" />
              Ofertas H&amp;D
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2
              id="titulo-descuentos"
              className="texto-3d mt-5 font-display text-[clamp(3.3rem,14vw,9.5rem)] font-extrabold uppercase leading-[0.85] tracking-tight text-white"
            >
              Descuentos
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-7 max-w-lg text-[15.5px] leading-relaxed text-chrome sm:text-[17px]">
              Motos y repuestos con precio rebajado. Pregunta por el tuyo y cómpralo por WhatsApp.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {maxMotos > 0 && (
                <li className="rounded-full border border-cyan/40 bg-cyan/10 px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-white">
                  Motos hasta −{maxMotos}%
                </li>
              )}
              {maxRepuestos > 0 && (
                <li className="rounded-full border border-cyan/40 bg-cyan/10 px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-white">
                  Repuestos hasta −{maxRepuestos}%
                </li>
              )}
            </ul>
          </Reveal>
          <Reveal delay={270}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={waLink(WA_DESCUENTOS)} external={waReady}>
                Comprar por WhatsApp
              </Button>
              {motos.length > 0 && (
                <Button variant="outline" onClick={() => abrirCatalogo({})}>
                  Ver motos en oferta
                </Button>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-cyan/25 bg-void/70 p-5 shadow-lift backdrop-blur-md sm:p-7">
            {video && (
              <video
                src={video.src}
                poster={video.poster}
                aria-label={video.titulo}
                autoPlay={!reducido}
                controls={reducido}
                muted
                loop
                playsInline
                preload="metadata"
                className="mb-6 aspect-video w-full rounded-2xl border border-white/10 object-cover"
              />
            )}

            {motos.length > 0 && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-cyan">
                  Motos en oferta
                </p>
                <ul className="mt-3 divide-y divide-white/[0.08]">
                  {motos.map((o) => (
                    <li key={o.id} className="flex items-end justify-between gap-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-display text-[1.15rem] font-bold uppercase leading-tight text-chrome sm:text-[1.35rem]">
                          {o.nombre}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-silver line-through">{formatCOP(o.anterior)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <p className="font-display text-[1.2rem] font-extrabold leading-none text-white [font-variant-numeric:tabular-nums] sm:text-[1.45rem]">
                          {formatCOP(o.precio)}
                        </p>
                        <span className="rounded-md bg-red-btn px-2 py-1 text-[11px] font-bold text-white">
                          −{rebaja(o.precio, o.anterior)}%
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {repuestos.length > 0 && (
              <button
                type="button"
                onClick={() => abrirRepuestos({})}
                className="group mt-4 flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-left text-[13px] font-semibold text-chrome transition-colors hover:border-cyan/50"
              >
                <span>{repuestos.length} repuestos en oferta</span>
                <IconArrow className="h-4 w-4 text-cyan transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
