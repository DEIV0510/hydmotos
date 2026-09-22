import { formatCOP } from '@/data/motos'
import { useSettingsVivo } from '@/lib/settings-live'

/**
 * Número y mensajes de WhatsApp: ya no viven repetidos por todo el código,
 * salen de `useSettingsVivo()` (Fase 3, editable en /admin/contenido → WhatsApp
 * y Contacto). Por eso es un hook y no funciones sueltas: necesita leer el
 * Context en cada componente que lo use.
 */
export function useWa() {
  const { contact, whatsapp } = useSettingsVivo()
  const numero = contact.whatsapp

  /** Si aún no hay número configurado, el enlace lleva a la sección de contacto en vez de abrir un chat inválido */
  const waLink = (message: string) => (numero ? `https://wa.me/${numero}?text=${encodeURIComponent(message)}` : '#contacto')

  /** true cuando el enlace abre WhatsApp de verdad (hay número configurado) */
  const waReady = Boolean(numero)

  /** Mensaje del botón «Comprar» de cada moto, con {PRODUCT_NAME} y {PRICE} ya resueltos */
  const waForMoto = (name: string, price?: number | null) =>
    whatsapp.productMessageTemplate
      .replace(/\{PRODUCT_NAME\}/g, name)
      .replace(/\{PRICE\}/g, price ? formatCOP(price) : '')

  return { waLink, waReady, WA_GENERAL: whatsapp.generalMessage, waForMoto }
}
