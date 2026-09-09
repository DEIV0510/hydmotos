import { useEffect, useMemo, useState } from 'react'
import MotoCard from '@/components/MotoCard'
import MotoModal from '@/components/MotoModal'
import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconSearch, IconClose, IconChevron } from '@/components/art/Icons'
import { CATEGORIES, MOTOS, STATS, type CategoryId, type Moto } from '@/data/motos'

type SortId = 'destacados' | 'precio-asc' | 'precio-desc' | 'autonomia' | 'velocidad' | 'potencia'

const SORTS: { id: SortId; label: string }[] = [
  { id: 'destacados', label: 'Destacados' },
  { id: 'precio-asc', label: 'Menor precio' },
  { id: 'precio-desc', label: 'Mayor precio' },
  { id: 'autonomia', label: 'Mayor autonomía' },
  { id: 'velocidad', label: 'Mayor velocidad' },
  { id: 'potencia', label: 'Mayor potencia' },
]

/** Motos visibles antes de pulsar "Ver más": mantiene la página corta */
const PAGE = 8

export default function Catalog() {
  const [cat, setCat] = useState<CategoryId | 'todas'>('todas')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortId>('destacados')
  const [detail, setDetail] = useState<Moto | null>(null)
  const [shown, setShown] = useState(PAGE)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

    const out = MOTOS.filter((m) => {
      if (cat !== 'todas' && m.category !== cat) return false
      if (!q) return true
      const haystack = `${m.name} ${m.battery} ${m.capacity} ${m.brakes} ${m.power}w ${m.range}km ${m.speed}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
      return haystack.includes(q)
    })

    const by: Record<SortId, (a: Moto, b: Moto) => number> = {
      // ofertas primero, luego mejor relación autonomía/precio
      destacados: (a, b) =>
        Number(Boolean(b.oldPrice)) - Number(Boolean(a.oldPrice)) || b.range / b.price - a.range / a.price,
      'precio-asc': (a, b) => a.price - b.price,
      'precio-desc': (a, b) => b.price - a.price,
      autonomia: (a, b) => b.range - a.range,
      velocidad: (a, b) => b.speed - a.speed,
      potencia: (a, b) => b.power - a.power,
    }
    return [...out].sort(by[sort])
  }, [cat, query, sort])

  // Al cambiar filtro, búsqueda u orden se vuelve al primer bloque
  useEffect(() => setShown(PAGE), [cat, query, sort])

  const counts = useMemo(() => {
    const map = new Map<string, number>([['todas', MOTOS.length]])
    for (const m of MOTOS) map.set(m.category, (map.get(m.category) ?? 0) + 1)
    return map
  }, [])

  const visible = list.slice(0, shown)
  const restantes = list.length - visible.length

  return (
    <section id="motos" className="relative scroll-mt-20 bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            tone="light"
            eyebrow="Catálogo"
            title={
              <>
                Encuentra tu
                <br />
                próxima moto
              </>
            }
            sub={`${STATS.total} modelos eléctricos, ${STATS.offers} en oferta. Filtra, compara y cotiza en un clic.`}
          />

          {/* Búsqueda + orden */}
          <Reveal delay={120}>
            <div className="flex flex-col gap-2.5 sm:flex-row lg:shrink-0">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar modelo…"
                  aria-label="Buscar moto por nombre o característica"
                  className="h-[46px] w-full rounded-full border border-ink/12 bg-card pl-11 pr-10 text-[14px] text-ink placeholder:text-slate transition-colors focus:border-blue focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:w-56"
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

              <div className="relative">
                <label htmlFor="orden" className="sr-only">
                  Ordenar catálogo
                </label>
                <select
                  id="orden"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortId)}
                  className="h-[46px] w-full cursor-pointer appearance-none rounded-full border border-ink/12 bg-card pl-5 pr-11 text-[13px] font-medium text-ink transition-colors focus:border-blue focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:w-52"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <IconChevron className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Categorías */}
        <Reveal delay={160}>
          <div
            className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filtrar por categoría"
          >
            {CATEGORIES.map((c) => {
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
                  {c.label}
                  <span className={on ? 'text-white/70' : 'text-slate'}>{counts.get(c.id) ?? 0}</span>
                </button>
              )
            })}
          </div>
        </Reveal>

        <p className="mt-5 text-[12px] font-medium uppercase tracking-widest2 text-slate" aria-live="polite">
          {list.length === visible.length
            ? `${list.length} ${list.length === 1 ? 'modelo' : 'modelos'}`
            : `${visible.length} de ${list.length} modelos`}
        </p>

        {list.length > 0 ? (
          <>
            <ul className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((m, i) => (
                <Reveal as="li" key={m.id} delay={Math.min(i % PAGE, 5) * 60} className="h-full">
                  <MotoCard moto={m} onOpen={setDetail} />
                </Reveal>
              ))}
            </ul>

            {restantes > 0 && (
              <div className="mt-9 text-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + PAGE)}
                  className="group inline-flex min-h-[52px] items-center gap-2.5 rounded-full border border-ink/15 bg-card px-8 text-[12px] font-bold uppercase tracking-widest2 text-ink shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-card-hover"
                >
                  Ver {Math.min(restantes, PAGE)} modelos más
                  <IconChevron className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-ink/[0.09] bg-card px-6 py-14 text-center shadow-card">
            <p className="font-display text-2xl font-bold uppercase text-ink">Sin resultados</p>
            <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-slate">
              No encontramos motos con esa búsqueda. Prueba con otro nombre o mira el catálogo completo.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCat('todas')
              }}
              className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-ink px-7 text-[12px] font-bold uppercase tracking-widest2 text-white transition-colors hover:bg-blue-deep"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </div>

      <MotoModal moto={detail} onClose={() => setDetail(null)} />
    </section>
  )
}
