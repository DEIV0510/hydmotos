import { Button, Reveal } from '@/components/ui/Primitives'
import { CARRO, type Media } from '@/data/media'
import { useWa } from '@/lib/wa'

const FARO = CARRO.find((m) => m.id === 'faro') as Media

/**
 * Cierre comercial. Usa el mismo carro de la portada, en detalle, para que la
 * página empiece y termine con la misma imagen.
 */
export default function CTA() {
  const { waLink, waReady, WA_GENERAL } = useWa()
  const wa = waLink(WA_GENERAL)

  return (
    <section className="relative bg-void px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <div className="relative mx-auto grid max-w-content overflow-hidden rounded-lg border border-white/[0.09] bg-graphite lg:grid-cols-[1fr_1.1fr]">
          <div className="relative z-10 p-7 sm:p-12 lg:p-16">
            <span className="eyebrow">
              <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
              Da el paso
            </span>
            <h2 className="mt-4 font-display text-[clamp(2.1rem,6vw,3.6rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
              ¿Listo para
              <br />
              encontrar la tuya<span className="text-red">?</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
              Escríbenos por WhatsApp con el modelo que te interesa y resolvemos tus dudas.
            </p>
            <div className="mt-8">
              <Button href={wa} external={waReady}>
                Consultar por WhatsApp
              </Button>
            </div>
          </div>

          {/* La foto entera, sin fundidos ni recorte, en su propio marco dentro de la tarjeta */}
          <div className="relative flex items-center px-5 pb-5 sm:px-8 sm:pb-8 lg:py-8 lg:pl-0 lg:pr-8">
            <img
              src={FARO.src}
              srcSet={FARO.srcSet}
              sizes="(min-width: 1024px) 680px, 90vw"
              width={FARO.width}
              height={FARO.height}
              alt={FARO.alt}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full rounded-lg border border-white/10"
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
