/**
 * ⚙️ CONFIGURACIÓN DEL SITIO — H&D MOTORENS
 * ---------------------------------------------------------------
 * Todo lo editable del negocio vive aquí. Cambiar un valor en este
 * archivo lo actualiza en toda la web (navbar, contacto, footer,
 * botones de WhatsApp y datos estructurados de SEO).
 */

/**
 * 📞 NÚMERO DE WHATSAPP — PENDIENTE
 * Formato internacional SIN "+", sin espacios ni guiones.
 * Ejemplo Colombia: '573001234567'
 * Mientras esté vacío, los botones llevan a la sección de contacto
 * en lugar de abrir un chat roto.
 */
export const WHATSAPP_NUMBER: string = ''

/** 📞 Teléfono visible. Vacío = no se muestra la fila. */
export const PHONE: string = ''

/** ✉️ Correo de contacto. Vacío = no se muestra la fila. */
export const EMAIL: string = ''

/** 📍 Dirección / ciudad. Vacío = no se muestra la fila. */
export const ADDRESS: string = ''

/** 🕐 Horario de atención */
export const SCHEDULE = 'Lunes a sábado · 8:00 a.m. – 6:00 p.m.'

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

export const NAV = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'motos', label: 'Motos' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'contacto', label: 'Contacto' },
]
