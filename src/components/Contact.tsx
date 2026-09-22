import { Reveal, SectionHead } from '@/components/ui/Primitives'
import {
  IconWhatsApp,
  IconPhone,
  IconPin,
  IconClock,
  IconMail,
  IconArrow,
} from '@/components/art/Icons'
import { useSettingsVivo } from '@/lib/settings-live'
import { useWa } from '@/lib/wa'

export default function Contact() {
  const { contact, social: SOCIAL } = useSettingsVivo()
  const { waLink, WA_GENERAL, waReady } = useWa()
  const wa = waLink(WA_GENERAL)
  const { phone: PHONE, email: EMAIL, address, city, schedule: SCHEDULE, mapsUrl } = contact
  const ADDRESS = [address, city].filter(Boolean).join(', ')

  // Solo se muestran las filas con dato real configurado en /admin/contenido
  const rows = [
    PHONE && { Icon: IconPhone, label: 'Teléfono', value: PHONE, href: `tel:${PHONE.replace(/\s/g, '')}` },
    EMAIL && { Icon: IconMail, label: 'Correo', value: EMAIL, href: `mailto:${EMAIL}` },
    ADDRESS && { Icon: IconPin, label: 'Ubicación', value: ADDRESS, href: mapsUrl || undefined },
    SCHEDULE && { Icon: IconClock, label: 'Horario', value: SCHEDULE },
  ].filter(Boolean) as { Icon: typeof IconPhone; label: string; value: string; href?: string }[]

  const socials = Object.entries(SOCIAL).filter(([, v]) => v) as [string, string][]

  return (
    <section id="contacto" className="relative py-14 sm:py-20">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHead
            eyebrow="10 · Contacto"
            title={<>Hablemos</>}
            sub="Respondemos por WhatsApp. Cuéntanos qué buscas y te asesoramos sin compromiso."
          />

          <div>
            {/* WhatsApp destacado */}
            <Reveal>
              <a
                href={wa}
                target={wa.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-lg border border-white/[0.09] surface p-5 transition-all duration-500 hover:-translate-y-1 hover:border-cyan/35 hover:shadow-lift sm:p-6"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366] transition-transform duration-500 group-hover:scale-110">
                  <IconWhatsApp className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-bold uppercase tracking-wide text-chrome">
                    WhatsApp
                  </span>
                  <span className="mt-0.5 block text-[13.5px] text-silver">
                    {waReady ? 'Escríbenos y cuéntanos qué buscas' : 'Número pendiente de configurar'}
                  </span>
                </span>
                <IconArrow className="h-5 w-5 shrink-0 text-cyan transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Reveal>

            {/* Datos: solo si hay alguno configurado; si no, la lista vacía dejaba un borde suelto */}
            {rows.length > 0 && (
            <ul className="mt-4 space-y-px overflow-hidden rounded-lg border border-white/[0.07]">
              {rows.map(({ Icon, label, value, href }, i) => (
                <Reveal as="li" key={label} delay={60 + i * 70}>
                  <div className="flex items-center gap-4 bg-white/[0.02] px-5 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-cyan">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-widest2 text-silver/72">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith('http') ? '_blank' : undefined}
                          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-[14.5px] font-medium text-chrome underline-offset-4 hover:text-cyan hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-[14.5px] font-medium text-chrome">{value}</p>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
            )}

            {socials.length > 0 && (
              <Reveal delay={200}>
                <div className="mt-5 flex flex-wrap gap-2">
                  {socials.map(([name, url]) => (
                    <a
                      key={name}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center rounded-md border border-white/12 px-5 text-[12px] font-semibold uppercase tracking-widest2 text-silver transition-colors hover:border-cyan/45 hover:text-cyan"
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
