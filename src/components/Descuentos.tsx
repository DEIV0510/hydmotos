import { Button, Reveal } from '@/components/ui/Primitives'
import { IconArrow } from '@/components/art/Icons'
import { formatCOP } from '@/data/motos'
import { VIDEOS_PROMO, type VideoPromo } from '@/data/promos'
import { abrirRepuestos } from '@/lib/catalogo'
import { useCatalogoVivo } from '@/lib/motos-live'
import { useRepuestosVivo } from '@/lib/repuestos-live'
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
  const { repuestos: REPUESTOS } = useRepuestosVivo()
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
  const topMotos = motos.slice(0, 3)

  return (
    <section
      id="descuentos"
      aria-labelledby="titulo-descuentos"
      className="relative isolate overflow-hidden bg-void py-16 sm:py-24"
    >
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
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {maxMotos > 0 && (
                <li className="rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-white">
                  Motos hasta −{maxMotos}%
                </li>
              )}
              {maxRepuestos > 0 && (
                <li className="rounded-md border border-cyan/40 bg-cyan/10 px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-white">
                  Repuestos hasta −{maxRepuestos}%
                </li>
              )}
            </ul>
          </Reveal>
          <Reveal delay={210}>
            <div className="mt-8">
              <Button href={waLink(WA_DESCUENTOS)} external={waReady}>
                Comprar por WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="rounded-lg border border-white/10 bg-graphite p-5 sm:p-7">
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
                className="mb-6 aspect-video w-full rounded-lg border border-white/10 object-cover"
              />
            )}

            {topMotos.length > 0 && (
              <ul className="divide-y divide-white/[0.08]">
                {topMotos.map((o) => (
                  <li key={o.id} className="flex items-end justify-between gap-4 py-3.5">
                    <p className="font-display text-[1.1rem] font-bold uppercase leading-tight text-chrome sm:text-[1.25rem]">
                      {o.nombre}
                    </p>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <p className="font-display text-[1.1rem] font-extrabold leading-none text-white [font-variant-numeric:tabular-nums] sm:text-[1.3rem]">
                        {formatCOP(o.precio)}
                      </p>
                      <span className="rounded-md bg-red-btn px-2 py-1 text-[11px] font-bold text-white">
                        −{rebaja(o.precio, o.anterior)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {repuestos.length > 0 && (
              <button
                type="button"
                onClick={() => abrirRepuestos({})}
                className={`group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-left text-[13px] font-semibold text-chrome transition-colors hover:border-cyan/50 ${topMotos.length ? 'mt-4' : ''}`}
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
