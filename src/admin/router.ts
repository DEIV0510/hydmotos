import { useEffect, useState } from 'react'

/**
 * Navegación mínima del panel: sin librería de rutas, solo lo que hace falta
 * para /admin, /admin/login y /admin/motos. La web pública no la usa.
 */
export function useRuta() {
  const [ruta, setRuta] = useState(location.pathname)

  useEffect(() => {
    const onPop = () => setRuta(location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const ir = (destino: string) => {
    if (destino !== location.pathname) {
      history.pushState(null, '', destino)
      setRuta(destino)
    }
  }

  return [ruta, ir] as const
}
