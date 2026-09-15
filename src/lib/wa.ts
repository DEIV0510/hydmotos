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
  'Hola, quiero información sobre las motos, patinetas y carros eléctricos de H&D MOTORENS.'

/** Mensaje del botón «Comprar» de cada moto */
export function waForMoto(name: string) {
  return `Hola, quiero comprar la moto ${name} que vi en la web de H&D MOTORENS. ¿Me confirman precio y disponibilidad?`
}

/** true cuando el enlace abre WhatsApp de verdad (hay número configurado) */
export const waReady = Boolean(WHATSAPP_NUMBER)
