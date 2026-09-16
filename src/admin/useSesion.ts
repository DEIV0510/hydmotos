import { useCallback, useEffect, useState } from 'react'

type Estado =
  | { cargando: true; email: null }
  | { cargando: false; email: string }
  | { cargando: false; email: null }

/** Sesión del administrador: la verifica el servidor, no una bandera en el navegador */
export function useSesion() {
  const [estado, setEstado] = useState<Estado>({ cargando: true, email: null })

  const revisar = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/session')
      const d = await r.json()
      setEstado(d.ok ? { cargando: false, email: d.email } : { cargando: false, email: null })
    } catch {
      setEstado({ cargando: false, email: null })
    }
  }, [])

  useEffect(() => {
    revisar()
  }, [revisar])

  const salir = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setEstado({ cargando: false, email: null })
  }, [])

  return { ...estado, revisar, salir }
}
