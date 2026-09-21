import { useState } from 'react'
import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconWhatsApp } from '@/components/art/Icons'
import { CARRO, CARRO_MINI, type Media } from '@/data/media'
import { waLink, waReady } from '@/lib/wa'

type Vehiculo = {
  id: string
  nombre: string
  /** Lo que se ve en las fotos: puertas, color del techo */
  detalle: string
  mensaje: string
  fotos: Media[]
}

/**
 * Carros eléctricos. El cliente los pidió como categoría (notas de voz del 11
 * y el 15/09). En el material hay fotos de dos carros, pero ningún nombre,
 * precio ni ficha: se presentan por lo que se ve en las fotos (color y
 * puertas) y el precio va por WhatsApp. No se inventa modelo ni cifra alguna.
 *
 * Las fotos van completas, sin recorte ni fundidos, como pidió el cliente.
 */
const VEHICULOS: Vehiculo[] = [
  {
    id: 'plateado',
    nombre: 'Carro eléctrico plateado',
    detalle: '5 puertas',
    mensaje:
      'Hola, quiero comprar el carro eléctrico plateado de 5 puertas que vi en la web de H&D MOTORENS. ¿Me confirman precio y disponibilidad?',
    fotos: ['tres-cuartos', 'lateral', 'frente', 'faro']
      .map((id) => CARRO.find((m) => m.id === id))
      .filter((m): m is Media => Boolean(m)),
  },
  {
    id: 'azul-claro',
    nombre: 'Carro eléctrico azul claro',
    detalle: '2 puertas · techo blanco',
    mensaje:
      'Hola, quiero comprar el carro eléctrico azul claro de 2 puertas que vi en la web de H&D MOTORENS. ¿Me confirman precio y disponibilidad?',
    fotos: CARRO_MINI,
  },
]

function Ficha({ v }: { v: Vehiculo }) {
  const [activa, setActiva] = useState(0)
  const foto = v.fotos[activa]
  const wa = waLink(v.mensaje)
  if (!foto) return null

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-cyan/20 bg-graphite shadow-lift">
      <div className="relative aspect-[4/3] bg-graphite">
        <img
          key={foto.id}
          src={foto.src}
          srcSet={foto.srcSet}
          sizes="(min-width: 1024px) 620px, 92vw"
          width={foto.width}
          height={foto.height}
          alt={foto.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full animate-[fade_.35s_ease-out_both] object-contain"
        />
      </div>

      {v.fotos.length > 1 && (
        <ul className="grid grid-cols-4 gap-2 border-t border-white/[0.07] p-3" aria-label={`Fotos del ${v.nombre}`}>
          {v.fotos.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                aria-label={`Ver foto ${i + 1} de ${v.fotos.length}`}
                aria-pressed={i === activa}
                className={`block aspect-[4/3] w-full overflow-hidden rounded-lg border bg-void transition-colors duration-300 ${
                  i === activa ? 'border-cyan' : 'border-white/10 hover:border-white/35'
                }`}
              >
                <img
                  src={f.src}
                  srcSet={f.srcSet}
                  sizes="140px"
                  alt=""
                  width={f.width}
                  height={f.height}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest2 text-cyan">{v.detalle}</p>
        <h3 className="mt-1.5 font-display text-[1.7rem] font-extrabold uppercase leading-none text-chrome sm:text-[2rem]">
          {v.nombre}
        </h3>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
          <p className="font-display text-[1.05rem] font-bold uppercase leading-tight tracking-wide text-silver">
            Precio por
            <br />
            WhatsApp
          </p>
          <a
            href={wa}
            target={waReady ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-full bg-blue px-7 text-[12.5px] font-bold uppercase tracking-widest2 text-white shadow-glow-blue transition-colors duration-300 hover:bg-blue-deep"
          >
            <IconWhatsApp className="h-4 w-4" />
            Comprar
          </a>
        </div>
      </div>
    </article>
  )
}

export default function Carros() {
  return (
    <section id="carros" className="relative bg-void py-16 sm:py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHead
          eyebrow="05 · Carros eléctricos"
          title={
            <>
              Carros
              <br />
              eléctricos
            </>
          }
          sub="Mira cada carro en todas sus fotos y pregunta por el precio y la disponibilidad por WhatsApp."
        />
        <ul className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {VEHICULOS.map((v, i) => (
            <Reveal as="li" key={v.id} delay={i * 90} className="h-full">
              <Ficha v={v} />
            </Reveal>
          ))}
        </ul>
      </div>

      <style>{`@keyframes fade { from { opacity:0 } to { opacity:1 } }`}</style>
    </section>
  )
}
