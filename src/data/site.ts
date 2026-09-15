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

export const NAV = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'motos', label: 'Motos' },
  { id: 'magma', label: 'MAGMA' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'repuestos', label: 'Repuestos' },
  { id: 'contacto', label: 'Contacto' },
]
