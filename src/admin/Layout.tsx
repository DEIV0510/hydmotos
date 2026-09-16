import { useState, type ReactNode } from 'react'
import { Logo } from '@/components/art/Logo'

const ITEMS = [
  { ruta: '/admin', label: 'Dashboard' },
  { ruta: '/admin/motos', label: 'Motos' },
]

export default function Layout({
  email,
  ruta,
  ir,
  onSalir,
  children,
}: {
  email: string
  /** La ruta actual y el navegador viven en AdminApp: una sola fuente, para que
   * el resaltado del menú y lo que se ve en <main> nunca queden desincronizados */
  ruta: string
  ir: (destino: string) => void
  onSalir: () => void
  children: ReactNode
}) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const Nav = ({ enMovil = false }: { enMovil?: boolean }) => (
    <nav className={enMovil ? 'space-y-1' : 'space-y-1'}>
      {ITEMS.map((it) => (
        <button
          key={it.ruta}
          type="button"
          onClick={() => {
            ir(it.ruta)
            setMenuAbierto(false)
          }}
          className={`flex min-h-[44px] w-full items-center rounded-lg px-3.5 text-left text-[13.5px] font-semibold transition-colors ${
            ruta === it.ruta ? 'bg-blue/15 text-chrome' : 'text-silver hover:bg-white/[0.05] hover:text-chrome'
          }`}
        >
          {it.label}
        </button>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      {/* Escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-graphite p-5 lg:flex">
        <Logo compact />
        <div className="mt-8 flex-1">
          <Nav />
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="truncate text-[11.5px] text-silver" title={email}>
            {email}
          </p>
          <button
            type="button"
            onClick={onSalir}
            className="mt-2 min-h-[40px] text-[12.5px] font-semibold text-silver hover:text-chrome"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Barra móvil */}
      <header className="flex items-center justify-between border-b border-ink/10 bg-graphite px-4 py-3 lg:hidden">
        <Logo compact />
        <button
          type="button"
          onClick={() => setMenuAbierto((v) => !v)}
          aria-expanded={menuAbierto}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-chrome"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuAbierto ? '✕' : '☰'}
        </button>
      </header>
      {menuAbierto && (
        <div className="border-b border-ink/10 bg-graphite p-4 lg:hidden">
          <Nav enMovil />
          <button
            type="button"
            onClick={onSalir}
            className="mt-3 min-h-[44px] w-full rounded-lg border border-white/15 text-[13px] font-semibold text-silver"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  )
}
