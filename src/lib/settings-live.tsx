import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * Hero, contacto, WhatsApp, SEO y menú, editables desde /admin/contenido
 * (Fase 3) sin tocar código. Mismo patrón que motos-live.tsx: los valores de
 * abajo son el contenido real de hoy, así que mientras no responda la API (o
 * si falla) la web se ve exactamente igual que antes de esta fase — nunca una
 * sección vacía ni un texto placeholder.
 */

export type HeroSettings = {
  kicker: string
  title1: string
  title2: string
  ctaLabel: string
  ctaHref: string
  poster: string | null
}

export type ContactSettings = {
  phone: string
  whatsapp: string
  email: string
  address: string
  city: string
  schedule: string
  mapsUrl: string
}

export type WhatsappSettings = {
  generalMessage: string
  productMessageTemplate: string
}

export type SeoSettings = {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  canonical: string
}

export type SocialSettings = {
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
}

export type NavItem = {
  id: string
  label: string
  href: string
  enabled: boolean
  newTab: boolean
  order: number
}

/** Video subido desde el panel; ancho/alto para enmarcarlo entero, sin recortar */
export type VideoSettings = {
  src: string
  poster: string | null
  ancho: number
  alto: number
}

export type VideosSettings = {
  /** null = el video original del local (/video/showroom.mp4) */
  showroom: VideoSettings | null
  /** null = el banner de Descuentos va sin video */
  promo: VideoSettings | null
}

export type SiteSettings = {
  hero: HeroSettings
  contact: ContactSettings
  whatsapp: WhatsappSettings
  seo: SeoSettings
  social: SocialSettings
  nav: NavItem[]
  videos: VideosSettings
}

const DEFAULTS: SiteSettings = {
  hero: {
    kicker: 'Movilidad eléctrica',
    title1: 'La ciudad,',
    title2: 'sin gasolina',
    ctaLabel: 'Ver modelos',
    ctaHref: '#motos',
    poster: null,
  },
  // Los que el cliente dio el 22-23/09: si la API falla, los botones no pueden
  // mandar a un número viejo
  contact: {
    phone: '301 438 2277',
    whatsapp: '573014382277',
    email: '',
    address: 'Calle 44 #3-98',
    city: 'Montería',
    schedule: '',
    mapsUrl: '',
  },
  whatsapp: {
    generalMessage: 'Hola, quiero información sobre las motos, patinetas y carros eléctricos de H&D MOTORENS.',
    productMessageTemplate:
      'Hola, quiero comprar la moto {PRODUCT_NAME} que vi en la web de H&D MOTORENS. ¿Me confirman precio y disponibilidad?',
  },
  seo: {
    metaTitle: 'H&D MOTORENS | Motos, patinetas y carros eléctricos',
    metaDescription:
      'Motos, patinetas y carros eléctricos, taller y más de 130 repuestos con precio. Consulta y compra por WhatsApp en H&D MOTORENS.',
    ogTitle: 'H&D MOTORENS | Motos, patinetas y carros eléctricos',
    ogDescription:
      'Motos, patinetas y carros eléctricos, taller y más de 130 repuestos con precio. Consulta y compra por WhatsApp en H&D MOTORENS.',
    ogImage: 'https://www.hydmotorens.com/og.jpg',
    canonical: 'https://www.hydmotorens.com/',
  },
  social: { instagram: '', facebook: '', tiktok: '', youtube: '' },
  nav: [
    { id: 'motos', label: 'Motos', href: '#motos', enabled: true, newTab: false, order: 0 },
    { id: 'patinetas', label: 'Patinetas', href: '#patinetas', enabled: true, newTab: false, order: 1 },
    { id: 'carros', label: 'Carros eléctricos', href: '#carros', enabled: true, newTab: false, order: 2 },
    { id: 'taller', label: 'Taller', href: '#taller', enabled: true, newTab: false, order: 3 },
    { id: 'repuestos', label: 'Repuestos', href: '#repuestos', enabled: true, newTab: false, order: 4 },
  ],
  videos: { showroom: null, promo: null },
}

/** Fusiona lo guardado con lo de arriba: un campo que falte (sección nueva, o
 * fila creada antes de sumar un campo) cae en el valor de hoy, no en `undefined`. */
function fusionar(remoto: Partial<Record<keyof SiteSettings, unknown>> | undefined): SiteSettings {
  if (!remoto) return DEFAULTS
  const nav = Array.isArray((remoto.nav as { items?: unknown })?.items)
    ? ((remoto.nav as { items: NavItem[] }).items as NavItem[])
    : DEFAULTS.nav
  return {
    hero: { ...DEFAULTS.hero, ...(remoto.hero as Partial<HeroSettings>) },
    contact: { ...DEFAULTS.contact, ...(remoto.contact as Partial<ContactSettings>) },
    whatsapp: { ...DEFAULTS.whatsapp, ...(remoto.whatsapp as Partial<WhatsappSettings>) },
    seo: { ...DEFAULTS.seo, ...(remoto.seo as Partial<SeoSettings>) },
    social: { ...DEFAULTS.social, ...(remoto.social as Partial<SocialSettings>) },
    nav: nav.filter((n) => n.enabled).sort((a, b) => a.order - b.order),
    videos: { ...DEFAULTS.videos, ...(remoto.videos as Partial<VideosSettings>) },
  }
}

/**
 * Estilo del marco de un video subido desde el panel: la proporción real del
 * video (se ve entero, sin recortar) y un ancho máximo si es vertical, para
 * que un video de celular no ocupe media página de alto.
 */
export function marcoDeVideo(v: VideoSettings, anchoMaxVertical: string) {
  const vertical = v.alto > v.ancho
  return {
    style: { aspectRatio: `${v.ancho} / ${v.alto}` },
    className: vertical ? `mx-auto w-full ${anchoMaxVertical}` : 'w-full',
  }
}

const SettingsVivoContext = createContext<SiteSettings>(DEFAULTS)

export function SettingsVivoProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(() => fusionar(undefined))

  useEffect(() => {
    let cancelado = false
    fetch('/api/public/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok: boolean; settings?: Record<string, unknown> } | null) => {
        if (cancelado || !d?.ok) return
        setSettings(fusionar(d.settings))
      })
      .catch(() => {
        /* sin ajustes disponibles: se queda con el contenido de hoy */
      })
    return () => {
      cancelado = true
    }
  }, [])

  return <SettingsVivoContext.Provider value={settings}>{children}</SettingsVivoContext.Provider>
}

export function useSettingsVivo() {
  return useContext(SettingsVivoContext)
}
