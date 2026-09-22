/**
 * ⚙️ CONFIGURACIÓN DEL SITIO — H&D MOTORENS
 * ---------------------------------------------------------------
 * Todo lo editable del negocio vive aquí. Cambiar un valor en este
 * archivo lo actualiza en toda la web (navbar, contacto, footer,
 * botones de WhatsApp y datos estructurados de SEO).
 */

/**
 * 📞 NÚMERO DE WHATSAPP
 * Formato internacional SIN "+", sin espacios ni guiones.
 */
export const WHATSAPP_NUMBER: string = '573102063400'

/** 📞 Teléfono visible. Vacío = no se muestra la fila. */
export const PHONE: string = '310 206 3400'

/** ✉️ Correo de contacto. Vacío = no se muestra la fila. */
export const EMAIL: string = ''

/** 📍 Dirección / ciudad. Vacío = no se muestra la fila. */
export const ADDRESS: string = 'Calle 44 #3-98, Montería'

/**
 * 🕐 Horario de atención — PENDIENTE. Vacío = no se muestra.
 * Antes decía «Lunes a sábado · 8:00 a.m. – 6:00 p.m.», pero ese horario lo
 * puse de ejemplo al crear la web y el cliente nunca lo confirmó.
 */
export const SCHEDULE: string = ''

/** 🔗 Redes sociales. Deja en '' las que no uses. */
export const SOCIAL: Record<string, string> = {
  instagram: '',
  facebook: '',
  tiktok: '',
}

export const BRAND = {
  name: 'H&D MOTORENS',
  short: 'H&D',
  tagline: 'Movilidad eléctrica',
  claim: 'La ciudad, sin gasolina.',
}

/**
 * Menú por categorías, como lo pidió el cliente en sus notas de voz del 11 y
 * el 15 de septiembre: motos, patinetas, carros eléctricos, taller y repuestos.
 * El logo lleva al inicio y el botón «Consultar», a WhatsApp; el pie añade
 * inicio y contacto.
 */
export const NAV = [
  { id: 'motos', label: 'Motos' },
  { id: 'patinetas', label: 'Patinetas' },
  { id: 'carros', label: 'Carros eléctricos' },
  { id: 'taller', label: 'Taller' },
  { id: 'repuestos', label: 'Repuestos' },
]
