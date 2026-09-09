import { Logo } from '@/components/art/Logo'
import { NAV, SOCIAL, SCHEDULE, PHONE, EMAIL } from '@/data/site'
import { STATS } from '@/data/motos'

export default function Footer() {
  const socials = Object.entries(SOCIAL).filter(([, v]) => v) as [string, string][]

  return (
    <footer className="relative border-t border-white/[0.07] bg-graphite">
      <div className="mx-auto max-w-content px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-silver">
              {STATS.total} modelos de motos eléctricas con autonomía de hasta {STATS.maxRange} km.
              Movilidad sin gasolina.
            </p>
          </div>

          <nav aria-label="Pie de página">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan/80">
              Navegación
            </h2>
            <ul className="mt-4 space-y-1">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a
                    href={`#${n.id}`}
                    className="group inline-flex py-1.5 text-[14px] text-silver transition-colors hover:text-chrome"
                  >
                    <span className="relative">
                      {n.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-cyan transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan/80">
              Contacto
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px] text-silver">
              {PHONE && (
                <li>
                  <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="hover:text-chrome">
                    {PHONE}
                  </a>
                </li>
              )}
              {EMAIL && (
                <li>
                  <a href={`mailto:${EMAIL}`} className="hover:text-chrome">
                    {EMAIL}
                  </a>
                </li>
              )}
              <li>{SCHEDULE}</li>
            </ul>

            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center rounded-full border border-white/12 px-4 text-[11px] font-semibold uppercase tracking-widest2 text-silver transition-colors hover:border-cyan/45 hover:text-cyan"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-7 text-[12.5px] text-silver/72 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} H&amp;D MOTORENS. Todos los derechos reservados.</p>
          <p>Precios en pesos colombianos. Sujetos a cambio sin previo aviso.</p>
        </div>
      </div>
    </footer>
  )
}
