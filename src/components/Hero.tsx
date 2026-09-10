import { Button } from '@/components/ui/Primitives'
import { STATS, formatCOP, MOTOS, photoOf } from '@/data/motos'
import { waLink, WA_GENERAL } from '@/lib/wa'

/**
 * Portada.
 * Protagonista: la foto real del modelo destacado, no una ilustración.
 * El fondo es un degradado sobrio con una sombra de apoyo bajo el vehículo;
 * sin halos de color ni retículas luminosas, para que parezca la portada de
 * un concesionario y no una composición de efectos.
 */

/** Modelo de portada. Para cambiarlo basta con poner otro id. */
const DESTACADO = 'tigre'

export default function Hero() {
  // Si el destacado no tuviera foto, la portada se quedaría vacía: se cae
  // al primer modelo que sí tenga foto recortada y precio.
  const elegido = MOTOS.find((m) => m.id === DESTACADO && m.image)
  const moto =
    elegido ?? MOTOS.find((m) => m.image && m.photoFit !== 'cover' && m.price) ?? MOTOS[0]
  const foto = photoOf(moto)
  const wa = waLink(WA_GENERAL)

  return (
    <section id="inicio" className="relative isolate overflow-hidden pb-12 pt-[92px] sm:pb-16 sm:pt-[112px]">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Degradado de estudio: claro arriba a la derecha, oscuro abajo */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_18%,#242A34_0%,#161A21_45%,#0B0D11_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
      </div>

      <div className="mx-auto grid max-w-content items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        {/* ---------------- Copy ---------------- */}
        <div className="relative z-10 max-w-xl">
          <p className="inline-flex animate-[hero-in_.6s_ease-out_.05s_both] items-center gap-2.5 border-l-2 border-red pl-3 text-[11px] font-semibold uppercase tracking-widest2 text-silver">
            {STATS.total} modelos eléctricos disponibles
          </p>

          <h1 className="mt-5 font-display text-[clamp(2.7rem,9vw,5rem)] font-extrabold uppercase leading-[0.92] tracking-tight text-chrome">
            <span className="block animate-[hero-in_.7s_ease-out_.12s_both]">La ciudad,</span>
            <span className="block animate-[hero-in_.7s_ease-out_.22s_both]">
              sin gasolina<span className="text-red">.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-md animate-[hero-in_.7s_ease-out_.32s_both] text-[15.5px] leading-relaxed text-silver sm:text-[16.5px]">
            Motos eléctricas listas para rodar. Hasta {STATS.maxRange} km de autonomía y modelos
            que <strong className="font-semibold text-chrome">no exigen SOAT ni matrícula</strong>.
          </p>

          <div className="mt-8 flex animate-[hero-in_.7s_ease-out_.42s_both] flex-col gap-3 xs:flex-row">
            <Button href={wa} external={wa.startsWith('http')}>
              Cotizar ahora
            </Button>
            <Button href="#motos" variant="outline">
              Ver motos
            </Button>
          </div>

          <dl className="mt-10 grid animate-[hero-in_.7s_ease-out_.52s_both] grid-cols-3 gap-4 border-t border-white/[0.09] pt-6">
            {[
              { v: `${STATS.maxRange} km`, l: 'Autonomía máx.' },
              { v: `${STATS.maxSpeed} km/h`, l: 'Velocidad máx.' },
              { v: `Desde ${formatCOP(STATS.minPrice).replace(/\s?COP/, '')}`, l: 'Precio' },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-display text-[clamp(1.1rem,3.4vw,1.5rem)] font-bold leading-none text-chrome">
                  {s.v}
                </dd>
                <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-silver">
                  {s.l}
                </p>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------------- Vehículo ---------------- */}
        <div className="relative animate-[hero-photo_.9s_cubic-bezier(.16,1,.3,1)_.15s_both]">
          {foto ? (
            <img
              src={foto.src}
              srcSet={foto.srcSet}
              sizes="(max-width: 1024px) 88vw, 620px"
              width={900}
              height={900}
              // Es la imagen principal de la portada: se carga la primera
              fetchPriority="high"
              decoding="async"
              alt={`Moto eléctrica ${moto.name} de H&D MOTORENS`}
              className="relative z-10 mx-auto w-full max-w-[560px] object-contain drop-shadow-[0_36px_36px_rgba(0,0,0,0.55)]"
            />
          ) : null}

          {/* Sombra de apoyo en el suelo */}
          <div
            className="pointer-events-none absolute inset-x-[16%] bottom-[12%] h-6 rounded-[50%] bg-black/60 blur-2xl"
            aria-hidden="true"
          />

          {/* Ficha del modelo de portada */}
          <div className="relative z-10 mx-auto mt-1 flex max-w-[560px] animate-[hero-in_.7s_ease-out_.6s_both] items-center justify-between gap-4 border-t border-white/[0.09] pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest2 text-silver">
                En portada
              </p>
              <p className="mt-1 font-display text-xl font-bold uppercase leading-none text-chrome">
                {moto.name}
              </p>
            </div>
            <ul className="flex gap-5">
              {[
                moto.range && { v: `${moto.range} km`, l: 'Autonomía' },
                moto.speed && { v: `${moto.speed} km/h`, l: 'Velocidad' },
              ]
                .filter(Boolean)
                .map((s) => {
                  const spec = s as { v: string; l: string }
                  return (
                    <li key={spec.l} className="text-right">
                      <p className="font-display text-[15px] font-bold leading-none text-chrome">
                        {spec.v}
                      </p>
                      <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wider text-silver">
                        {spec.l}
                      </p>
                    </li>
                  )
                })}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
        @keyframes hero-photo { from { opacity:0; transform: translateY(22px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}
