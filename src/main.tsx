import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { CatalogoVivoProvider } from '@/lib/motos-live'
import { RepuestosVivoProvider } from '@/lib/repuestos-live'
import { SettingsVivoProvider } from '@/lib/settings-live'
import './index.css'

// El panel de administración es privado y pesado (formularios, tabla): solo
// se descarga si alguien entra a /admin, nunca para un visitante normal.
const AdminApp = lazy(() => import('./admin/AdminApp'))

const esAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {esAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <SettingsVivoProvider>
        <CatalogoVivoProvider>
          <RepuestosVivoProvider>
            <App />
          </RepuestosVivoProvider>
        </CatalogoVivoProvider>
      </SettingsVivoProvider>
    )}
  </StrictMode>,
)
