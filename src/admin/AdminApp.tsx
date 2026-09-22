import Login from './Login'
import Layout from './Layout'
import Dashboard from './Dashboard'
import MotosList from './MotosList'
import RepuestosList from './RepuestosList'
import ContenidoPanel from './ContenidoPanel'
import { useRuta } from './router'
import { useSesion } from './useSesion'

/**
 * /admin — panel privado de H&D MOTORENS.
 *
 * Solo se carga (por `main.tsx`, con `lazy()`) cuando la URL empieza por
 * /admin, así que nunca pesa en la web pública. La sesión la verifica el
 * servidor en cada carga (`GET /api/admin/session`, cookie HttpOnly): entrar
 * directo a /admin/motos sin haber iniciado sesión lleva al login, no a la
 * tabla de motos.
 */
export default function AdminApp() {
  const sesion = useSesion()
  const [ruta, ir] = useRuta()

  if (sesion.cargando) return null // evita el parpadeo del login antes de saber si ya hay sesión

  if (!sesion.email) return <Login onEntrar={sesion.revisar} />

  return (
    <Layout email={sesion.email} ruta={ruta} ir={ir} onSalir={sesion.salir}>
      {ruta === '/admin/motos' ? (
        <MotosList />
      ) : ruta === '/admin/repuestos' ? (
        <RepuestosList />
      ) : ruta === '/admin/contenido' ? (
        <ContenidoPanel />
      ) : (
        <Dashboard />
      )}
    </Layout>
  )
}
