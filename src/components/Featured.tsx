import { useCallback, useMemo, useState } from 'react'
import MotoModal from '@/components/MotoModal'
import PhotoPending from '@/components/art/PhotoPending'
import { DataStrip, Reveal, SectionHead, TechFrame } from '@/components/ui/Primitives'
import { IconArrow, IconBattery, IconGauge, IconRoute } from '@/components/art/Icons'
import { CATEGORIES, formatCOP, photoOf, type Moto } from '@/data/motos'
import { useTilt } from '@/hooks/useTilt'
import { abrirCatalogo } from '@/lib/catalogo'
import { useCatalogoVivo } from '@/lib/motos-live'
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
function elegirDestacados(MOTOS: Moto[], n: number): Moto[] {
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

function Tarjeta({ moto, onOpen }: { moto: Moto; onOpen: (m: Moto) => void }) {
  const tilt = useTilt<HTMLElement>(4)
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
      className="group relative flex h-full flex-row overflow-hidden rounded-lg border border-ink/[0.07] bg-card shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-blue/25 hover:shadow-card-hover [transform:perspective(1200px)_rotateX(var(--rx,0))_rotateY(var(--ry,0))] sm:flex-col"
    >
      {/* Foto */}
      <div
        className={`relative min-h-[132px] w-[42%] shrink-0 overflow-hidden sm:aspect-[4/3] sm:min-h-0 sm:w-full ${
          cover ? 'bg-paper2' : 'bg-[radial-gradient(75%_65%_at_50%_62%,#FFFFFF_0%,#E6EAF0_100%)]'
        }`}
      >
        {off > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-red-btn px-2 py-1 text-[9.5px] font-bold uppercase tracking-widest2 text-white sm:left-4 sm:top-4 sm:px-2.5 sm:text-[10px]">
            −{off}%
          </span>
        )}

        {foto ? (
          <img
            src={foto.src}
            srcSet={foto.srcSet}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 46vw, 42vw"
            alt={`Moto eléctrica ${moto.name}`}
            width={cover ? 1000 : 900}
            height={cover ? 750 : 900}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05] ${
              cover ? 'object-cover' : 'object-contain p-2.5 sm:p-5'
            }`}
          />
        ) : (
          <PhotoPending name={moto.name} />
        )}
      </div>

      {/* Datos */}
      <div className="relative flex min-w-0 flex-1 flex-col p-3.5 sm:p-5">
        {tipo && (
          <p className="text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep sm:text-[10.5px]">
            {tipo}
          </p>
        )}
        <h3 className="mt-1 font-display text-[1.1rem] font-extrabold uppercase leading-[0.95] text-ink sm:text-[1.35rem]">
          {moto.name}
        </h3>

        {cifras.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {cifras.map(({ Icon, v, l }) => (
              <li key={l} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-blue" />
                <span className="font-display text-[12.5px] font-bold leading-none text-ink sm:text-[13.5px]">
                  {v}
                </span>
                <span className="sr-only">{l}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2.5 pt-3">
          <div className="min-w-0">
            {moto.oldPrice && (
              <p className="text-[11px] font-medium text-slate line-through sm:text-[12px]">
                {formatCOP(moto.oldPrice)}
              </p>
            )}
            <p className="font-display text-[1.1rem] font-extrabold leading-none tracking-tight text-ink [font-variant-numeric:tabular-nums] sm:text-[1.3rem]">
              {formatCOP(moto.price ?? 0)}
            </p>
          </div>
          <a
            href={wa}
            target={waReady ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="relative z-20 inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue px-4 text-[10.5px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-blue-deep hover:shadow-glow-blue active:scale-[0.98] sm:px-5 sm:text-[11px]"
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
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      />
    </article>
  )
}

/**
 * Máquina destacada: la ficha principal ya no es "la tarjeta grande", es una
 * presentación propia — panel oscuro a lo ancho, foto grande y lectura de
 * especificaciones tipo tablero, más cerca de una ficha de vehículo que de
 * una tarjeta de catálogo.
 */
function Flagship({ moto, onOpen }: { moto: Moto; onOpen: (m: Moto) => void }) {
  const foto = photoOf(moto)
  const off = descuento(moto)
  const wa = waLink(waForMoto(moto.name))
  const tipo = CATEGORIES.find((c) => c.id === moto.category)?.label
  const cover = moto.photoFit === 'cover'

  const cifras = [
    moto.range ? { v: `${moto.range} km`, l: 'Autonomía' } : null,
    moto.speed ? { v: `${moto.speed} km/h`, l: 'Velocidad' } : null,
    moto.power ? { v: `${moto.power.toLocaleString('es-CO')} W`, l: 'Motor' } : null,
  ].filter((c): c is { v: string; l: string } => c !== null)

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/[0.08] bg-graphite">
      <TechFrame inset={16} size={22} />
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* Foto */}
        <div
          className={`relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[420px] ${
            cover ? 'bg-void' : 'bg-[radial-gradient(72%_60%_at_50%_58%,#1B212B_0%,#0B0D11_100%)]'
          }`}
        >
          <div className="absolute inset-x-5 top-5 z-10 flex flex-wrap items-start justify-between gap-x-3 gap-y-2 sm:inset-x-7 sm:top-7">
            <p className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan sm:tracking-widest3">
              Máquina destacada
            </p>
            {off > 0 && (
              <span className="rounded-md bg-red-btn px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-widest2 text-white">
                Oferta −{off}%
              </span>
            )}
          </div>
          {foto ? (
            <img
              src={foto.src}
              srcSet={foto.srcSet}
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt={`Moto eléctrica ${moto.name}`}
              width={cover ? 1000 : 900}
              height={cover ? 750 : 900}
              loading="eager"
              decoding="async"
              className={`absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.035] ${
                cover ? 'object-cover' : 'object-contain p-9 sm:p-14'
              }`}
            />
          ) : (
            <PhotoPending name={moto.name} />
          )}
        </div>

        {/* Datos */}
        <div className="relative flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest2 text-blue-soft">
            {tipo}
            {moto.matricula ? ' · Con matrícula' : ''}
          </p>
          <h3 className="mt-2 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-extrabold uppercase leading-[0.92] text-chrome">
            {moto.name}
          </h3>

          {cifras.length > 0 && (
            <DataStrip items={cifras} tone="light" size="lg" className="mt-7 max-w-md border-t border-white/[0.12] pt-5" />
          )}

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.12] pt-6">
            <div>
              {moto.oldPrice && (
                <p className="text-[12px] font-medium text-silver line-through">{formatCOP(moto.oldPrice)}</p>
              )}
              <p className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-none tracking-tight text-chrome [font-variant-numeric:tabular-nums]">
                {formatCOP(moto.price ?? 0)}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => onOpen(moto)}
                className="inline-flex min-h-[48px] items-center rounded-md border border-white/20 px-5 text-[12px] font-bold uppercase tracking-widest2 text-chrome transition-colors hover:border-cyan/50"
              >
                Ver ficha
              </button>
              <a
                href={wa}
                target={waReady ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-md bg-blue px-6 text-[12px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-blue-deep hover:shadow-glow-blue"
              >
                Comprar
                <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Featured() {
  const { motos: MOTOS } = useCatalogoVivo()
  const destacados = useMemo(() => elegirDestacados(MOTOS, 5), [MOTOS])
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
    [MOTOS],
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

        <Reveal className="mt-8 sm:mt-10">
          <Flagship moto={principal} onOpen={setDetalle} />
        </Reveal>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
                    className="group relative flex h-full min-h-[132px] w-full flex-col items-start overflow-hidden rounded-lg border border-ink/[0.07] bg-card p-4 text-left shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover sm:min-h-[176px] sm:p-5"
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
