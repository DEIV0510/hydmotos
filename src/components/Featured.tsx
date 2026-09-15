import { useCallback, useMemo, useState } from 'react'
import MotoModal from '@/components/MotoModal'
import PhotoPending from '@/components/art/PhotoPending'
import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconArrow, IconBattery, IconGauge, IconRoute } from '@/components/art/Icons'
import { CATEGORIES, MOTOS, formatCOP, photoOf, type Moto } from '@/data/motos'
import { useTilt } from '@/hooks/useTilt'
import { abrirCatalogo } from '@/lib/catalogo'
import { waForMoto, waLink, waReady } from '@/lib/wa'

const descuento = (m: Moto) =>
  m.oldPrice && m.price ? Math.round(((m.oldPrice - m.price) / m.oldPrice) * 100) : 0

const recortada = (m: Moto) => Boolean(m.image) && m.photoFit !== 'cover'

/**
 * Qué se destaca. No es un «más vendidos», porque ese dato no existe: son
 * modelos con precio publicado y foto, las ofertas primero (de mayor a menor
 * descuento) y después, por rondas, uno de cada tipo empezando por el que más
 * modelos tiene. Entre iguales ganan las fotos de estudio recortadas y el
 * precio más alto. Todo sale del catálogo: si cambia, la selección cambia.
 */
function elegirDestacados(n: number): Moto[] {
  const conPrecio = MOTOS.filter((m) => m.price && m.image)
  const elegidos = conPrecio
    .filter((m) => m.oldPrice)
    .sort((a, b) => descuento(b) - descuento(a))
    .slice(0, n)

  const orden = [...conPrecio].sort(
    (a, b) => Number(recortada(b)) - Number(recortada(a)) || (b.price ?? 0) - (a.price ?? 0),
  )
  const tamaño = (c: string) => MOTOS.filter((m) => m.category === c).length
  const tipos = [...new Set(MOTOS.map((m) => m.category))].sort((a, b) => tamaño(b) - tamaño(a))
  // Dos fichas con el mismo nombre (hay dos FAMILY PLUS) no van juntas
  const usado = (m: Moto) => elegidos.some((e) => e.id === m.id || e.name === m.name)

  for (let ronda = 0; elegidos.length < n; ronda++) {
    let añadidos = 0
    for (const t of tipos) {
      if (elegidos.length >= n) break
      if (elegidos.filter((e) => e.category === t).length > ronda) continue
      const m = orden.find((x) => x.category === t && !usado(x))
      if (m) {
        elegidos.push(m)
        añadidos++
      }
    }
    if (!añadidos) break
  }
  return elegidos
}

function Tarjeta({
  moto,
  grande = false,
  onOpen,
}: {
  moto: Moto
  grande?: boolean
  onOpen: (m: Moto) => void
}) {
  const tilt = useTilt<HTMLElement>(grande ? 2.5 : 4)
  const foto = photoOf(moto)
  const off = descuento(moto)
  const wa = waLink(waForMoto(moto.name))
  const tipo = CATEGORIES.find((c) => c.id === moto.category)?.label
  const cover = moto.photoFit === 'cover'

  const cifras = [
    moto.range ? { Icon: IconRoute, v: `${moto.range} km`, l: 'Autonomía' } : null,
    moto.speed ? { Icon: IconGauge, v: `${moto.speed} km/h`, l: 'Velocidad' } : null,
    moto.power ? { Icon: IconBattery, v: `${moto.power.toLocaleString('es-CO')} W`, l: 'Motor' } : null,
  ].filter((c): c is { Icon: typeof IconRoute; v: string; l: string } => c !== null)

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={`group relative flex h-full overflow-hidden rounded-3xl border border-ink/[0.07] bg-card shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-blue/25 hover:shadow-card-hover [transform:perspective(1200px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] ${
        grande ? 'flex-col' : 'flex-row sm:flex-col'
      }`}
    >
      {/* Foto */}
      <div
        className={`relative shrink-0 overflow-hidden ${
          cover ? 'bg-paper2' : 'bg-[radial-gradient(75%_65%_at_50%_62%,#FFFFFF_0%,#E6EAF0_100%)]'
        } ${
          grande
            ? 'aspect-[4/3] lg:aspect-auto lg:min-h-[300px] lg:flex-1'
            : 'min-h-[132px] w-[42%] sm:aspect-[4/3] sm:min-h-0 sm:w-full'
        }`}
      >
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5 sm:left-4 sm:top-4">
          {off > 0 && (
            <span className="rounded-md bg-red-btn px-2 py-1 text-[9.5px] font-bold uppercase tracking-widest2 text-white sm:px-2.5 sm:text-[10px]">
              {grande ? 'Oferta ' : ''}−{off}%
            </span>
          )}
          {grande && moto.matricula && (
            <span className="rounded-md border border-blue/25 bg-card/85 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep backdrop-blur">
              Con matrícula
            </span>
          )}
        </div>

        {foto ? (
          <img
            src={foto.src}
            srcSet={foto.srcSet}
            sizes={
              grande
                ? '(min-width: 1024px) 640px, 92vw'
                : '(min-width: 1024px) 300px, (min-width: 640px) 46vw, 42vw'
            }
            alt={`Moto eléctrica ${moto.name}`}
            width={cover ? 1000 : 900}
            height={cover ? 750 : 900}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05] ${
              cover ? 'object-cover' : grande ? 'object-contain p-6 sm:p-10' : 'object-contain p-2.5 sm:p-5'
            }`}
          />
        ) : (
          <PhotoPending name={moto.name} />
        )}
      </div>

      {/* Datos */}
      <div
        className={`relative flex min-w-0 flex-1 flex-col ${
          grande ? 'p-5 sm:p-7 lg:flex-none' : 'p-3.5 sm:p-5'
        }`}
      >
        {tipo && (
          <p className="text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep sm:text-[10.5px]">
            {tipo}
          </p>
        )}
        <h3
          className={`mt-1 font-display font-extrabold uppercase leading-[0.95] text-ink ${
            grande ? 'text-[clamp(1.9rem,4.4vw,3rem)]' : 'text-[1.1rem] sm:text-[1.35rem]'
          }`}
        >
          {moto.name}
        </h3>

        {cifras.length > 0 && (
          <ul className={`flex flex-wrap ${grande ? 'mt-4 gap-x-7 gap-y-2' : 'mt-2 gap-x-3 gap-y-1'}`}>
            {cifras.map(({ Icon, v, l }) => (
              <li key={l} className="flex items-center gap-1.5">
                <Icon className={`shrink-0 text-blue ${grande ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5'}`} />
                <span className="leading-none">
                  <span
                    className={`block font-display font-bold text-ink ${
                      grande ? 'text-[18px]' : 'text-[12.5px] sm:text-[13.5px]'
                    }`}
                  >
                    {v}
                  </span>
                  <span
                    className={
                      grande ? 'mt-1 block text-[9.5px] font-semibold uppercase tracking-wider text-slate' : 'sr-only'
                    }
                  >
                    {l}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div
          className={`mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2.5 ${
            grande ? 'pt-6' : 'pt-3'
          }`}
        >
          <div className="min-w-0">
            {moto.oldPrice && (
              <p className="text-[11px] font-medium text-slate line-through sm:text-[12px]">
                {formatCOP(moto.oldPrice)}
              </p>
            )}
            <p
              className={`font-display font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] ${
                grande ? 'text-[clamp(1.7rem,3.4vw,2.4rem)]' : 'text-[1.1rem] sm:text-[1.3rem]'
              }`}
            >
              {formatCOP(moto.price ?? 0)}
            </p>
          </div>
          <a
            href={wa}
            target={waReady ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`relative z-20 inline-flex items-center justify-center rounded-full bg-blue font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-blue-deep hover:shadow-glow-blue active:scale-[0.98] ${
              grande ? 'min-h-[50px] px-7 text-[12px]' : 'min-h-[44px] px-4 text-[10.5px] sm:px-5 sm:text-[11px]'
            }`}
          >
            Comprar
          </a>
        </div>
      </div>

      {/* Toda la tarjeta abre la ficha, por debajo del botón de WhatsApp */}
      <button
        type="button"
        onClick={() => onOpen(moto)}
        aria-label={`Ver detalles de ${moto.name}`}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      />
    </article>
  )
}

export default function Featured() {
  const destacados = useMemo(() => elegirDestacados(5), [])
  const [detalle, setDetalle] = useState<Moto | null>(null)
  const cerrar = useCallback(() => setDetalle(null), [])

  // Accesos por tipo, cada uno con una foto recortada de ese tipo
  const tipos = useMemo(
    () =>
      CATEGORIES.filter((c) => c.id !== 'todas')
        .map((c) => {
          const modelos = MOTOS.filter((m) => m.category === c.id)
          const muestra =
            modelos.find((m) => recortada(m) && m.price) ?? modelos.find(recortada) ?? null
          return { id: c.id, label: c.label, total: modelos.length, muestra }
        })
        .filter((t) => t.total > 0),
    [],
  )

  if (!destacados.length) return null
  const [principal, ...resto] = destacados

  return (
    <section className="relative bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHead
            tone="light"
            eyebrow="01 · Destacados"
            title={
              <>
                Listos para
                <br />
                rodar
              </>
            }
            sub="Modelos con precio publicado. Las ofertas van primero."
          />
          <Reveal delay={120}>
            <button
              type="button"
              onClick={() => abrirCatalogo({})}
              className="group inline-flex min-h-[44px] items-center gap-2 text-[12px] font-bold uppercase tracking-widest2 text-ink transition-colors hover:text-blue-deep"
            >
              Ver los {MOTOS.length} modelos
              <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
          <Reveal as="li" className="h-full sm:col-span-2 lg:row-span-2">
            <Tarjeta moto={principal} grande onOpen={setDetalle} />
          </Reveal>
          {resto.map((m, i) => (
            <Reveal as="li" key={m.id} delay={(i + 1) * 70} className="h-full">
              <Tarjeta moto={m} onOpen={setDetalle} />
            </Reveal>
          ))}
        </ul>

        {/* Accesos por tipo */}
        <div className="mt-12 sm:mt-16">
          <Reveal>
            <h3 className="font-display text-[1.5rem] font-bold uppercase leading-none text-ink sm:text-[1.8rem]">
              Explora por tipo
            </h3>
          </Reveal>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {tipos.map((t, i) => {
              const foto = t.muestra ? photoOf(t.muestra) : null
              return (
                <Reveal as="li" key={t.id} delay={i * 60} className="h-full">
                  <button
                    type="button"
                    onClick={() => abrirCatalogo({ cat: t.id })}
                    className="group relative flex h-full min-h-[132px] w-full flex-col items-start overflow-hidden rounded-2xl border border-ink/[0.07] bg-card p-4 text-left shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover sm:min-h-[176px] sm:p-5"
                  >
                    <span className="relative z-10 font-display text-[1.25rem] font-bold uppercase leading-none text-ink sm:text-[1.6rem]">
                      {t.label}
                    </span>
                    <span className="relative z-10 mt-1.5 text-[12px] font-semibold text-slate">
                      {t.total} {t.total === 1 ? 'modelo' : 'modelos'}
                    </span>
                    <span className="relative z-10 mt-auto inline-flex items-center gap-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest2 text-blue-deep">
                      Ver
                      <IconArrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    {foto && (
                      <img
                        src={foto.src}
                        alt=""
                        aria-hidden="true"
                        width={450}
                        height={450}
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute -bottom-4 -right-5 w-[62%] max-w-[190px] object-contain transition-transform duration-700 group-hover:-translate-x-1 group-hover:scale-105 sm:-bottom-6 sm:w-[56%]"
                      />
                    )}
                  </button>
                </Reveal>
              )
            })}
          </ul>
        </div>
      </div>

      <MotoModal moto={detalle} onClose={cerrar} />
    </section>
  )
}
