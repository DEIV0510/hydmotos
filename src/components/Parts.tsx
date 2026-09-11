import { useEffect, useMemo, useState } from 'react'
import { Reveal, SectionHead } from '@/components/ui/Primitives'
import {
  IconBattery,
  IconPlug,
  IconTire,
  IconBrake,
  IconLight,
  IconDash,
  IconShock,
  IconTools,
  IconBolt,
  IconSearch,
  IconClose,
  IconChevron,
  IconWhatsApp,
} from '@/components/art/Icons'
import {
  REPUESTOS,
  CATEGORIAS_REPUESTO,
  STATS_REPUESTOS,
  photoOfPart,
  type Repuesto,
} from '@/data/repuestos'
import { formatCOP } from '@/data/motos'
import { waLink, waReady } from '@/lib/wa'
import PartModal, { waForPart } from '@/components/PartModal'

const ICONOS = {
  battery: IconBattery,
  plug: IconPlug,
  tire: IconTire,
  brake: IconBrake,
  shock: IconShock,
  light: IconLight,
  dash: IconDash,
  tools: IconTools,
  bolt: IconBolt,
} as const

/** Piezas visibles antes de pulsar "Ver más" */
const PAGE = 8

export default function Parts() {
  const [cat, setCat] = useState<string>('todas')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)
  const [abierto, setAbierto] = useState<Repuesto | null>(null)

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
    return REPUESTOS.filter((r) => {
      if (cat !== 'todas' && r.category !== cat) return false
      if (!q) return true
      return `${r.name} ${r.sku ?? ''} ${r.category} ${r.sub ?? ''} ${r.description ?? ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .includes(q)
    })
  }, [cat, query])

  useEffect(() => setShown(PAGE), [cat, query])

  const visibles = lista.slice(0, shown)
  const restantes = lista.length - visibles.length

  return (
    <section id="repuestos" className="relative scroll-mt-20 bg-paper2 py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            tone="light"
            eyebrow="Repuestos"
            title={
              <>
                Todo para tu
                <br />
                eléctrica
              </>
            }
            sub={`${STATS_REPUESTOS.total} repuestos en ${STATS_REPUESTOS.categorias} categorías, desde ${formatCOP(STATS_REPUESTOS.minPrice)}. Búscalo por nombre o referencia.`}
          />

          <Reveal delay={120}>
            <div className="relative lg:shrink-0">
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar repuesto o ref…"
                aria-label="Buscar repuesto por nombre o referencia"
                className="h-[46px] w-full rounded-full border border-ink/12 bg-card pl-11 pr-10 text-[14px] text-ink placeholder:text-slate transition-colors focus:border-blue focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:w-64"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate hover:text-ink"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {/* Categorías */}
        <Reveal delay={160}>
          <div
            className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filtrar repuestos por categoría"
          >
            {[{ id: 'todas', total: REPUESTOS.length }, ...CATEGORIAS_REPUESTO].map((c) => {
              const on = cat === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCat(c.id)}
                  aria-pressed={on}
                  className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-[12px] font-semibold uppercase tracking-widest2 transition-all duration-300 ${
                    on
                      ? 'border-ink bg-ink text-white'
                      : 'border-ink/12 bg-card text-slate hover:border-ink/35 hover:text-ink'
                  }`}
                >
                  {c.id === 'todas' ? 'Todas' : c.id}
                  <span className={on ? 'text-white/70' : 'text-slate'}>{c.total}</span>
                </button>
              )
            })}
          </div>
        </Reveal>

        <p className="mt-5 text-[12px] font-medium uppercase tracking-widest2 text-slate" aria-live="polite">
          {lista.length === visibles.length
            ? `${lista.length} ${lista.length === 1 ? 'repuesto' : 'repuestos'}`
            : `${visibles.length} de ${lista.length} repuestos`}
        </p>

        {lista.length > 0 ? (
          <>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {visibles.map((r, i) => {
                const Icon = ICONOS[r.icon]
                const foto = photoOfPart(r)
                const wa = waLink(waForPart(r))
                const off =
                  r.oldPrice && r.price
                    ? Math.round(((r.oldPrice - r.price) / r.oldPrice) * 100)
                    : 0

                return (
                  <Reveal as="li" key={r.id} delay={Math.min(i % PAGE, 5) * 55} className="h-full">
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink/[0.07] bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:border-blue/25 hover:shadow-card-hover">
                      <div className="relative aspect-square overflow-hidden bg-white">
                        {off > 0 && (
                          <span className="absolute left-2.5 top-2.5 z-10 rounded-md bg-red-btn px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest2 text-white">
                            −{off}%
                          </span>
                        )}
                        {foto ? (
                          <img
                            src={foto.src}
                            srcSet={foto.srcSet}
                            sizes="(max-width: 640px) 46vw, (max-width: 1280px) 30vw, 240px"
                            alt={r.name}
                            width={360}
                            height={360}
                            loading={i < 4 ? 'eager' : 'lazy'}
                            decoding="async"
                            className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-paper2/60 text-slate">
                            <Icon className="h-10 w-10" />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <p className="text-[9.5px] font-semibold uppercase tracking-widest2 text-blue-deep">
                          {r.category}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-ink sm:text-[13.5px]">
                          {r.name}
                        </h3>
                        {r.sku && <p className="mt-1 text-[10.5px] text-slate">Ref. {r.sku}</p>}

                        <div className="mt-2.5 flex items-baseline gap-2">
                          {r.price ? (
                            <>
                              <p className="font-display text-[1.15rem] font-extrabold leading-none text-ink [font-variant-numeric:tabular-nums] sm:text-[1.3rem]">
                                {formatCOP(r.price)}
                              </p>
                              {r.oldPrice && (
                                <p className="text-[11px] text-slate line-through">
                                  {formatCOP(r.oldPrice)}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-[12px] font-bold uppercase tracking-wide text-blue-deep">
                              Consultar
                            </p>
                          )}
                        </div>

                        <a
                          href={wa}
                          target={waReady ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="relative z-20 mt-3 inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-ink text-[11px] font-bold uppercase tracking-widest2 text-white transition-all duration-300 hover:bg-red-btn hover:shadow-glow-red active:scale-[0.98]"
                        >
                          Pedir
                        </a>
                      </div>

                      {/*
                        Toda la tarjeta abre la ficha; queda por debajo del CTA
                        de WhatsApp (z-20) para no robarle el toque.
                      */}
                      <button
                        type="button"
                        onClick={() => setAbierto(r)}
                        aria-label={`Ver detalles de ${r.name}`}
                        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                      />
                    </article>
                  </Reveal>
                )
              })}
            </ul>

            {restantes > 0 && (
              <div className="mt-9 text-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE * 2)}
                  className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full border border-ink/15 bg-card px-8 text-[12px] font-bold uppercase tracking-widest2 text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-card-hover"
                >
                  Ver {Math.min(restantes, PAGE * 2)} repuestos más
                  <IconChevron className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-ink/[0.09] bg-card px-6 py-14 text-center shadow-card">
            <p className="font-display text-2xl font-bold uppercase text-ink">Sin resultados</p>
            <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-slate">
              No encontramos ese repuesto. Escríbenos con la referencia o una foto de la pieza y te
              decimos si la tenemos.
            </p>
            <a
              href={waLink('Hola, busco un repuesto para mi moto eléctrica. ¿Me ayudan en H&D MOTORENS?')}
              target={waReady ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-ink px-7 text-[12px] font-bold uppercase tracking-widest2 text-white transition-colors hover:bg-red-btn"
            >
              <IconWhatsApp className="h-5 w-5" />
              Preguntar por WhatsApp
            </a>
          </div>
        )}
      </div>

      <PartModal
        part={abierto}
        onClose={() => setAbierto(null)}
        icon={abierto ? ICONOS[abierto.icon] : IconTools}
      />
    </section>
  )
}
