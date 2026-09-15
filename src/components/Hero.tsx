import { Button } from '@/components/ui/Primitives'
import { STATS, formatCOP, MOTOS, photoOf } from '@/data/motos'
import { waLink, WA_GENERAL } from '@/lib/wa'
import { prioridad } from '@/lib/img'

/**
 * Portada.
 * Protagonista: la foto real del modelo destacado, no una ilustración.
 * El fondo es un degradado sobrio con una sombra de apoyo bajo el vehículo;
 * sin halos de color ni retículas luminosas, para que parezca la portada de
 * un concesionario y no una composición de efectos.
 *
 * En escritorio es una rejilla de 2×2: arriba el mensaje y la moto; abajo, en
 * una sola banda y sobre la misma línea, las cifras del catálogo y la ficha del
 * modelo de portada. Antes cada columna llevaba su propia fila de datos y, como
 * la foto era más alta que el texto, quedaban a 80 px de altura una de otra con
 * una franja vacía entre medias.
 */

/** Modelo de portada. Para cambiarlo basta con poner otro id. */
const DESTACADO = 'tigre'

/** Las dos mitades de la banda comparten tipografía para leerse como una */
const CIFRA = 'font-display text-[clamp(1.1rem,3.4vw,1.5rem)] font-bold leading-none text-chrome'
const ETIQUETA = 'mt-1.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-silver'

export default function Hero() {
  // Si el destacado no tuviera foto, la portada se quedaría vacía: se cae
  // al primer modelo que sí tenga foto recortada y precio.
  const elegido = MOTOS.find((m) => m.id === DESTACADO && m.image)
  const moto =
    elegido ?? MOTOS.find((m) => m.image && m.photoFit !== 'cover' && m.price) ?? MOTOS[0]
  const foto = photoOf(moto)
  const wa = waLink(WA_GENERAL)

  // La foto recortada es un lienzo cuadrado con la moto centrada y mucho aire
  // arriba y abajo. photoAspect (lo mide `npm run catalog`) es la proporción
  // que encuadra solo la moto: con object-cover ese aire desaparece.
  const aspecto = moto.photoFit === 'cover' ? 4 / 3 : (moto.photoAspect ?? 1)

  const cifras = [
    { v: `${STATS.maxRange} km`, l: 'Autonomía máx.' },
    { v: `${STATS.maxSpeed} km/h`, l: 'Velocidad máx.' },
    { v: `Desde ${formatCOP(STATS.minPrice).replace(/\s?COP/, '')}`, l: 'Precio' },
  ]
  const ficha = [
    moto.range ? { v: `${moto.range} km`, l: 'Autonomía' } : null,
    moto.speed ? { v: `${moto.speed} km/h`, l: 'Velocidad' } : null,
  ].filter((s): s is { v: string; l: string } => s !== null)

  return (
    <section
      id="inicio"
      // En escritorio la portada y la franja de ventajas (53 px) llenan justo la
      // primera pantalla; en portátiles bajos manda el contenido, que cabe en
      // unos 625 px para que la banda de cifras no quede bajo el pliegue.
      className="relative isolate overflow-hidden pb-10 pt-[92px] sm:pb-14 sm:pt-[108px] lg:flex lg:min-h-[calc(100svh_-_53px)] lg:flex-col lg:justify-center lg:pb-10 lg:pt-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* Degradado de estudio: claro arriba a la derecha, oscuro abajo */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_18%,#242A34_0%,#161A21_45%,#0B0D11_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/*
        El orden del DOM es el del móvil: mensaje, cifras, moto y su ficha. En
        escritorio cada bloque se coloca en su celda de la rejilla. Por debajo de
        lg todo va alineado a la izquierda con el mismo ancho máximo (600 px):
        centrar solo la moto dejaba en tablet dos bordes izquierdos distintos.
      */}
      <div className="mx-auto grid w-full max-w-content gap-y-8 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)] lg:gap-x-10">
        {/* ---------------- Mensaje ---------------- */}
        <div className="relative z-10 max-w-xl lg:col-start-1 lg:row-start-1 lg:self-center">
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
        </div>

        {/* ---------------- Cifras del catálogo ---------------- */}
        {/*
          En escritorio se estira 20 px hacia el hueco entre columnas, igual que
          la ficha por el otro lado: las dos líneas superiores se tocan y la
          banda se lee como una sola.
        */}
        <dl className="grid max-w-[600px] animate-[hero-in_.7s_ease-out_.52s_both] grid-cols-3 gap-4 border-t border-white/[0.09] pt-6 lg:col-start-1 lg:row-start-2 lg:-mr-5 lg:max-w-none lg:self-start lg:pr-5">
          {cifras.map((s) => (
            // La etiqueta va antes en el DOM (dt antes que dd) y se pinta debajo
            <div key={s.l} className="flex flex-col-reverse">
              <dt className={ETIQUETA}>{s.l}</dt>
              <dd className={CIFRA}>{s.v}</dd>
            </div>
          ))}
        </dl>

        {/* ---------------- Vehículo ---------------- */}
        <div className="relative w-full max-w-[600px] animate-[hero-photo_.9s_cubic-bezier(.16,1,.3,1)_.15s_both] lg:col-start-2 lg:row-start-1 lg:max-w-none lg:self-center">
          {/* Sombra de apoyo en el suelo, a la altura de las ruedas */}
          <div
            className="pointer-events-none absolute inset-x-[14%] bottom-[3%] h-6 rounded-[50%] bg-black/60 blur-2xl"
            aria-hidden="true"
          />
          {foto && (
            <img
              src={foto.src}
              srcSet={foto.srcSet}
              sizes="(max-width: 1024px) 92vw, 600px"
              width={900}
              height={Math.round(900 / aspecto)}
              // Es la imagen principal de la portada: se carga la primera
              {...prioridad('high')}
              decoding="async"
              alt={`Moto eléctrica ${moto.name} de H&D MOTORENS`}
              style={{ aspectRatio: aspecto }}
              className={`relative z-10 w-full object-cover ${
                moto.photoFit === 'cover'
                  ? 'rounded-2xl'
                  : 'drop-shadow-[0_28px_28px_rgba(0,0,0,0.55)]'
              }`}
            />
          )}
        </div>

        {/* ---------------- Ficha del modelo de portada ---------------- */}
        <div className="-mt-3 flex w-full max-w-[600px] animate-[hero-in_.7s_ease-out_.6s_both] items-end justify-between gap-6 border-t border-white/[0.09] pt-6 lg:col-start-2 lg:row-start-2 lg:-ml-5 lg:mt-0 lg:w-auto lg:max-w-none lg:self-start lg:pl-5">
          <div className="flex flex-col-reverse">
            <p className={ETIQUETA}>En portada</p>
            <p className={`${CIFRA} uppercase`}>{moto.name}</p>
          </div>
          {ficha.length > 0 && (
            <dl className="flex gap-6 text-right sm:gap-8">
              {ficha.map((s) => (
                <div key={s.l} className="flex flex-col-reverse">
                  <dt className={ETIQUETA}>{s.l}</dt>
                  <dd className={CIFRA}>{s.v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <style>{`
        @keyframes hero-in { from { opacity:0; transform: translateY(16px) } to { opacity:1; transform:none } }
        @keyframes hero-photo { from { opacity:0; transform: translateY(22px) scale(.97) } to { opacity:1; transform:none } }
      `}</style>
    </section>
  )
}
