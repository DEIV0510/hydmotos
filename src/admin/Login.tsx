import { useState } from 'react'
import { Logo } from '@/components/art/Logo'

export default function Login({ onEntrar }: { onEntrar: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const d = await r.json()
      if (!r.ok || !d.ok) {
        setError(d.error || 'No se pudo iniciar sesión.')
        return
      }
      onEntrar()
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-void px-5">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-graphite p-8 shadow-lift">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-5 text-center text-[11px] font-semibold uppercase tracking-widest2 text-cyan">
          Administración
        </h1>

        <form onSubmit={enviar} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-[12.5px] font-medium text-silver">
              Correo electrónico
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-white/15 bg-void px-3.5 text-[14px] text-chrome outline-none focus-visible:border-blue-soft"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-[12.5px] font-medium text-silver">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={verPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-void px-3.5 pr-16 text-[14px] text-chrome outline-none focus-visible:border-blue-soft"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wide text-silver hover:text-chrome"
              >
                {verPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-[13px] text-red">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 flex min-h-[46px] w-full items-center justify-center rounded-lg bg-blue text-[13px] font-bold uppercase tracking-widest2 text-white transition-colors hover:bg-blue-deep disabled:opacity-60"
          >
            {cargando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </main>
  )
}
