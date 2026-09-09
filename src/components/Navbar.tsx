import { useEffect, useState } from 'react'
import { Logo } from '@/components/art/Logo'
import { NAV } from '@/data/site'
import { waLink, WA_GENERAL } from '@/lib/wa'

export default function Navbar() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('inicio')

  // Fondo sólido al hacer scroll
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sección activa
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (vis) setActive(vis.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.6] },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  // Menú móvil: bloquear scroll y cerrar con Escape
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <a
        href="#motos"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-cyan focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-void"
      >
        Saltar al catálogo
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          solid
            ? 'border-b border-white/[0.07] bg-void/80 shadow-[0_10px_40px_-16px_rgba(0,0,0,.9)] backdrop-blur-xl'
            : 'border-b border-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-[74px] max-w-content items-center justify-between gap-4 px-5 sm:px-8"
          aria-label="Principal"
        >
          <a href="#inicio" className="flex min-h-[44px] shrink-0 items-center" aria-label="H&D MOTORENS, inicio">
            <Logo compact />
          </a>

          {/* Desktop */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? 'page' : undefined}
                  className={`relative flex min-h-[44px] items-center px-4 text-[12.5px] font-semibold uppercase tracking-widest2 transition-colors ${
                    active === n.id ? 'text-cyan' : 'text-silver hover:text-chrome'
                  }`}
                >
                  {n.label}
                  <span
                    className={`absolute inset-x-4 bottom-2 h-px origin-left bg-cyan transition-transform duration-300 ${
                      active === n.id ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={waLink(WA_GENERAL)}
              target={waLink(WA_GENERAL).startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="hidden min-h-[44px] items-center rounded-full bg-red-btn px-6 text-[12px] font-bold uppercase tracking-widest2 text-white shadow-glow-red transition-all duration-300 hover:-translate-y-0.5 hover:bg-red sm:inline-flex"
            >
              Cotizar
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] lg:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={`absolute inset-x-0 top-0 h-[2px] rounded bg-chrome transition-all duration-300 ${
                    open ? 'top-1.5 rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1.5 h-[2px] rounded bg-chrome transition-all duration-200 ${
                    open ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-3 h-[2px] rounded bg-chrome transition-all duration-300 ${
                    open ? 'top-1.5 -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Menú móvil */}
      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-0 z-[99] lg:hidden"
        onClick={() => setOpen(false)}
      >
        <div className="absolute inset-0 bg-void/85 backdrop-blur-xl" />
        <nav
          className="relative flex h-full flex-col justify-center px-8 pb-24 pt-24"
          aria-label="Menú móvil"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="space-y-1">
            {NAV.map((n, i) => (
              <li
                key={n.id}
                style={{ animationDelay: `${i * 55 + 60}ms` }}
                className="animate-[menu-in_.5s_cubic-bezier(.16,1,.3,1)_both]"
              >
                <a
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-white/[0.07] py-4 font-display text-[2.1rem] font-bold uppercase leading-none text-chrome transition-colors active:text-cyan"
                >
                  <span className="font-sans text-[11px] font-semibold tracking-widest2 text-cyan/80">
                    0{i + 1}
                  </span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={waLink(WA_GENERAL)}
            target={waLink(WA_GENERAL).startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="mt-9 inline-flex min-h-[54px] animate-[menu-in_.5s_cubic-bezier(.16,1,.3,1)_.36s_both] items-center justify-center rounded-full bg-red-btn text-[13px] font-bold uppercase tracking-widest2 text-white shadow-glow-red"
          >
            Cotizar ahora
          </a>
        </nav>
        <style>{`@keyframes menu-in { from { opacity:0; transform: translateY(18px) } to { opacity:1; transform:none } }`}</style>
      </div>
    </>
  )
}
