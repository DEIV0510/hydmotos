import { Button, Reveal } from '@/components/ui/Primitives'
import { waLink, WA_GENERAL } from '@/lib/wa'
import { MOTOS, STATS, photoOf } from '@/data/motos'

/**
 * Modelo que acompaña al banner. Distinto del que sale en el hero, para no
 * repetir la misma foto en la misma página, y de los claros del catálogo: el
 * banner es grafito y una moto oscura recortada se pierde contra el fondo.
 * Si algún día se queda sin foto se coge la primera recortada que haya, en
 * lugar de dibujar nada.
 */
const ACOMPANA = 'reina'

export default function CTA() {
  const wa = waLink(WA_GENERAL)
  const moto =
    MOTOS.find((m) => m.id === ACOMPANA && m.image) ??
    MOTOS.find((m) => m.image && m.photoFit !== 'cover')
  const foto = moto && photoOf(moto)
  return (
    <section className="relative px-5 py-12 sm:px-8 sm:py-16">
      <Reveal>
        <div className="relative mx-auto max-w-content overflow-hidden rounded-[28px] border border-white/[0.09] bg-graphite sm:rounded-[36px]">
          {/* fondo */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-grid-tech bg-grid opacity-25" />
            <div className="absolute -left-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-blue/10 blur-[80px]" />
            <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-red/[0.06] blur-[80px]" />
          </div>

          <div className="relative grid items-center gap-6 p-7 sm:p-11 lg:grid-cols-[1.05fr_1fr] lg:p-14">
            <div>
              <span className="eyebrow">
                <span className="h-px w-7 bg-cyan/60" aria-hidden="true" />
                Da el paso
              </span>
              <h2 className="mt-4 font-display text-[clamp(2.1rem,7vw,3.8rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
                ¿Listo para
                <br />
                encontrar la tuya<span className="text-red">?</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-silver sm:text-base">
                Cuéntanos cuántos kilómetros haces al día y te decimos cuál de los {STATS.total}{' '}
                modelos te conviene.
              </p>
              <div className="mt-8">
                <Button href={wa} external={wa.startsWith('http')}>
                  Cotizar ahora
                </Button>
              </div>
            </div>

            {foto && (
              <div className="relative hidden lg:block">
                {/* Halo para despegar la foto del grafito del banner */}
                <div
                  className="absolute inset-6 rounded-full bg-blue/25 blur-[80px]"
                  aria-hidden="true"
                />
                <img
                  src={foto.src}
                  srcSet={foto.srcSet}
                  sizes="(max-width: 1024px) 0px, 600px"
                  alt={`Moto eléctrica ${moto!.name}`}
                  width={450}
                  height={450}
                  loading="lazy"
                  decoding="async"
                  className="relative w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,.7)]"
                />
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
