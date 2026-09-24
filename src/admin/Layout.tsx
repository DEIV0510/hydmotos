import { useState, type ReactNode } from 'react'
import { IconClose } from '@/components/art/Icons'
import { Logo } from '@/components/art/Logo'

const ITEMS = [
  { ruta: '/admin', label: 'Dashboard' },
  { ruta: '/admin/motos', label: 'Motos' },
  { ruta: '/admin/repuestos', label: 'Repuestos' },
  { ruta: '/admin/patinetas', label: 'Patinetas' },
  { ruta: '/admin/carros', label: 'Carros' },
  { ruta: '/admin/contenido', label: 'Contenido' },
]

/**
 * Fuera de Layout a propósito: definido adentro era un componente nuevo en
 * cada render, React lo desmontaba y montaba entero y el botón recién pulsado
 * perdía el foco del teclado.
 */
function Menu({ ruta, onElegir }: { ruta: string; onElegir: (destino: string) => void }) {
  return (
    <nav aria-label="Secciones del panel" className="space-y-1">
      {ITEMS.map((it) => {
        const activo = ruta === it.ruta
        return (
          <button
            key={it.ruta}
            type="button"
            onClick={() => onElegir(it.ruta)}
            aria-current={activo ? 'page' : undefined}
            className={`flex min-h-[44px] w-full items-center rounded-lg px-3.5 text-left text-[13.5px] font-semibold transition-colors ${
              activo ? 'bg-blue/15 text-chrome' : 'text-silver hover:bg-white/[0.05] hover:text-chrome'
            }`}
          >
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}

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

  const elegir = (destino: string) => {
    ir(destino)
    setMenuAbierto(false)
  }

  return (
    <div className="min-h-screen bg-paper text-ink lg:flex">
      {/* Escritorio */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-ink/10 bg-graphite p-5 lg:flex">
        <Logo compact />
        <div className="mt-8 flex-1">
          <Menu ruta={ruta} onElegir={elegir} />
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
          aria-controls="menu-admin"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-chrome"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuAbierto ? (
            <IconClose className="h-5 w-5" />
          ) : (
            <span className="flex w-[18px] flex-col gap-[4px]" aria-hidden="true">
              <span className="h-[2px] rounded bg-chrome" />
              <span className="h-[2px] rounded bg-chrome" />
              <span className="h-[2px] rounded bg-chrome" />
            </span>
          )}
        </button>
      </header>
      <div id="menu-admin" hidden={!menuAbierto} className="border-b border-ink/10 bg-graphite p-4 lg:hidden">
        <Menu ruta={ruta} onElegir={elegir} />
        <button
          type="button"
          onClick={onSalir}
          className="mt-3 min-h-[44px] w-full rounded-lg border border-white/15 text-[13px] font-semibold text-silver"
        >
          Cerrar sesión
        </button>
      </div>

      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  )
}
