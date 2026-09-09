import { WHATSAPP_NUMBER } from '@/data/site'

/**
 * Construye el enlace de WhatsApp con mensaje prellenado.
 * Si aún no hay número configurado devuelve '#contacto', para que
 * el botón siga siendo útil en vez de abrir un chat inválido.
 */
export function waLink(message: string) {
  if (!WHATSAPP_NUMBER) return '#contacto'
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WA_GENERAL =
  'Hola, estoy interesado en conocer las motos eléctricas disponibles de H&D MOTORENS.'

export function waForMoto(name: string) {
  return `Hola, estoy interesado en la moto ${name} de H&D MOTORENS. Quiero conocer más información.`
}

/** true cuando el enlace abre WhatsApp de verdad (hay número configurado) */
export const waReady = Boolean(WHATSAPP_NUMBER)
