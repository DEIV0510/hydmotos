import MotoArt from '@/components/art/MotoArt'
import { Button, Reveal } from '@/components/ui/Primitives'
import { waLink, WA_GENERAL } from '@/lib/wa'
import { STATS } from '@/data/motos'

export default function CTA() {
  const wa = waLink(WA_GENERAL)
  return (
    <section className="relative px-5 py-10 sm:px-8 sm:py-16">
      <Reveal>
        <div className="relative mx-auto max-w-content overflow-hidden rounded-[28px] border border-white/[0.09] bg-graphite sm:rounded-[36px]">
          {/* fondo */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-grid-tech bg-grid opacity-40" />
            <div className="absolute -left-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-blue/20 blur-[110px]" />
            <div className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-red/10 blur-[100px]" />
          </div>

          <div className="relative grid items-center gap-6 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:p-16">
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

            <div className="relative hidden lg:block">
              <div
                className="absolute inset-0 rounded-full bg-cyan/10 blur-[70px]"
                aria-hidden="true"
              />
              <MotoArt variant="trail" className="relative w-full drop-shadow-[0_24px_40px_rgba(0,0,0,.7)]" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
