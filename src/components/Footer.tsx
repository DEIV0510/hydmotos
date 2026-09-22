import { Logo } from '@/components/art/Logo'
import { STATS } from '@/data/motos'
import { useSettingsVivo } from '@/lib/settings-live'
import { useWa } from '@/lib/wa'

export default function Footer() {
  const { nav: NAV, contact, social: SOCIAL } = useSettingsVivo()
  const { waLink, waReady, WA_GENERAL } = useWa()
  // En el pie van también el inicio y el contacto, que el menú de arriba no lleva
  const ENLACES = [
    { id: 'inicio', label: 'Inicio', href: '#inicio' },
    ...NAV,
    { id: 'contacto', label: 'Contacto', href: '#contacto' },
  ]
  const socials = Object.entries(SOCIAL).filter(([, v]) => v) as [string, string][]
  const wa = waLink(WA_GENERAL)
  const PHONE = contact.phone
  const EMAIL = contact.email
  const SCHEDULE = contact.schedule

  return (
    <footer className="relative border-t border-white/[0.07] bg-graphite">
      {/* Margen inferior amplio: el botón flotante de WhatsApp no tapa la última línea */}
      <div className="mx-auto max-w-content px-5 pb-28 pt-12 sm:px-8 sm:pb-24 sm:pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-silver">
              Motos, patinetas y carros eléctricos, taller y repuestos. {STATS.total} modelos de
              motos con autonomía de hasta {STATS.maxRange} km.
            </p>
          </div>

          <nav aria-label="Pie de página">
            {/* Sin /80: con el azul eléctrico nuevo, atenuado bajaba de 4.5:1 sobre este fondo */}
            <h2 className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan">
              Navegación
            </h2>
            <ul className="mt-4 space-y-1">
              {ENLACES.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.href}
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
            <h2 className="text-[10px] font-semibold uppercase tracking-widest2 text-cyan">
              Contacto
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px] text-silver">
              {/* WhatsApp siempre: es el canal de la web aunque aún no haya teléfono ni correo */}
              <li>
                <a
                  href={wa}
                  target={waReady ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="hover:text-chrome"
                >
                  WhatsApp
                </a>
              </li>
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
              {SCHEDULE && <li>{SCHEDULE}</li>}
            </ul>

            {socials.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center rounded-md border border-white/12 px-4 text-[11px] font-semibold uppercase tracking-widest2 text-silver transition-colors hover:border-cyan/45 hover:text-cyan"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.07] pt-7 text-[12.5px] text-silver/72 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} H&amp;D MOTORENS. Todos los derechos reservados.</p>
          <p>Precios en pesos colombianos. Sujetos a cambio sin previo aviso.</p>
        </div>
      </div>
    </footer>
  )
}
