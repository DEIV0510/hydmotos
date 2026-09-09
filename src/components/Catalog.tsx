import { useMemo, useState } from 'react'
import MotoCard from '@/components/MotoCard'
import MotoModal from '@/components/MotoModal'
import { Reveal, SectionHead } from '@/components/ui/Primitives'
import { IconSearch, IconClose } from '@/components/art/Icons'
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

export default function Catalog() {
  const [cat, setCat] = useState<CategoryId | 'todas'>('todas')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortId>('destacados')
  const [detail, setDetail] = useState<Moto | null>(null)

  const list = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')

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

  const counts = useMemo(() => {
    const map = new Map<string, number>([['todas', MOTOS.length]])
    for (const m of MOTOS) map.set(m.category, (map.get(m.category) ?? 0) + 1)
    return map
  }, [])

  return (
    <section id="motos" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHead
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

        {/* ---------------- Controles ---------------- */}
        <Reveal delay={120}>
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Categorías */}
            <div
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
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
                        ? 'border-cyan/50 bg-cyan/10 text-cyan'
                        : 'border-white/10 bg-white/[0.03] text-silver hover:border-white/25 hover:text-chrome'
                    }`}
                  >
                    {c.label}
                    <span className={`text-[10px] ${on ? 'text-cyan/70' : 'text-silver/72'}`}>
                      {counts.get(c.id) ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Búsqueda + orden */}
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver/72" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar modelo…"
                  aria-label="Buscar moto por nombre o característica"
                  className="h-[46px] w-full rounded-full border border-white/10 bg-white/[0.03] pl-11 pr-10 text-[14px] text-chrome placeholder:text-silver/70 transition-colors focus:border-cyan/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:w-56"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-silver/75 hover:text-chrome"
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
                  className="h-[46px] w-full cursor-pointer appearance-none rounded-full border border-white/10 bg-white/[0.03] pl-5 pr-11 text-[13px] font-medium text-chrome transition-colors focus:border-cyan/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan sm:w-52"
                >
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id} className="bg-steel">
                      {s.label}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver/75"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ---------------- Resultados ---------------- */}
        <p className="mt-6 text-[12px] font-medium uppercase tracking-widest2 text-silver/72" aria-live="polite">
          {list.length} {list.length === 1 ? 'modelo' : 'modelos'}
        </p>

        {list.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
            {list.map((m, i) => (
              <Reveal as="li" key={m.id} delay={Math.min(i, 5) * 70} className="h-full">
                <MotoCard moto={m} onOpen={setDetail} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/[0.08] surface px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold uppercase text-chrome">Sin resultados</p>
            <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-silver">
              No encontramos motos con esa búsqueda. Prueba con otro nombre o mira el catálogo completo.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCat('todas')
              }}
              className="mt-6 inline-flex min-h-[48px] items-center rounded-full border border-cyan/40 bg-cyan/10 px-7 text-[12px] font-bold uppercase tracking-widest2 text-cyan transition-colors hover:bg-cyan/20"
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
