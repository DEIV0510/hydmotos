import { useEffect } from 'react'
import { useSettingsVivo } from '@/lib/settings-live'

/**
 * Aplica el título/descripción/canonical de /admin/contenido → SEO al
 * documento ya cargado: cambia lo que ve el buscador al indexar (Google
 * ejecuta JS) y el título de la pestaña.
 *
 * Lo que NO cambia con esto: la vista previa de WhatsApp/Facebook/Twitter
 * (Open Graph). Esas redes leen el HTML de index.html tal cual lo sirve el
 * servidor, sin ejecutar JS, así que siguen mostrando lo del último
 * despliegue hasta que se vuelva a construir el sitio con esos valores.
 */
export default function SeoMeta() {
  const { seo } = useSettingsVivo()

  useEffect(() => {
    document.title = seo.metaTitle

    const set = (selector: string, attr: 'content' | 'href', valor: string) => {
      if (!valor) return
      document.head.querySelector(selector)?.setAttribute(attr, valor)
    }
    set('meta[name="description"]', 'content', seo.metaDescription)
    set('link[rel="canonical"]', 'href', seo.canonical)
    set('meta[property="og:title"]', 'content', seo.ogTitle || seo.metaTitle)
    set('meta[property="og:description"]', 'content', seo.ogDescription || seo.metaDescription)
    set('meta[property="og:url"]', 'content', seo.canonical)
    set('meta[property="og:image"]', 'content', seo.ogImage)
  }, [seo])

  return null
}
