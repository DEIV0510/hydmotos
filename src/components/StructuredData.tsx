import { useEffect } from 'react'
import { REPUESTOS } from '@/data/repuestos'
import { ADDRESS, EMAIL, PHONE, SOCIAL, WHATSAPP_NUMBER } from '@/data/site'
import { useCatalogoVivo } from '@/lib/motos-live'

/**
 * Dirección pública de la web. Si se compra un dominio propio, cambiarla aquí
 * y en index.html, public/robots.txt y public/sitemap.xml.
 */
const SITE = 'https://hydmotos.vercel.app'

/**
 * Datos estructurados schema.org.
 * Se generan desde el catálogo real, así que los precios del buscador
 * siempre coinciden con los de la web. Solo se declaran los campos de
 * contacto que estén configurados en site.ts: nada inventado.
 */
export default function StructuredData() {
  const { motos: MOTOS, stats: STATS } = useCatalogoVivo()

  useEffect(() => {
    const org: Record<string, unknown> = {
      '@type': 'AutoDealer',
      '@id': `${SITE}/#organizacion`,
      name: 'H&D MOTORENS',
      description: `Motos, patinetas y carros eléctricos, taller y repuestos: ${STATS.total} modelos de motos, con autonomía de hasta ${STATS.maxRange} km, y ${REPUESTOS.length} repuestos con precio.`,
      url: SITE,
      image: `${SITE}/og.jpg`,
    }
    if (PHONE || WHATSAPP_NUMBER) org.telephone = PHONE || `+${WHATSAPP_NUMBER}`
    if (EMAIL) org.email = EMAIL
    if (ADDRESS) org.address = { '@type': 'PostalAddress', streetAddress: ADDRESS, addressCountry: 'CO' }
    const sameAs = Object.values(SOCIAL).filter(Boolean)
    if (sameAs.length) org.sameAs = sameAs

    /**
     * Una oferta sin precio no es válida en schema.org, y de las motos solo
     * tienen precio las que lo dio el cliente: el resto va sin `offers` en vez
     * de con un precio vacío.
     *
     * No se declara marca ni disponibilidad: H&D vende modelos de varias
     * marcas (ninguno es de marca H&D) y la existencia en tienda no está
     * confirmada.
     */
    const producto = (
      name: string,
      category: string,
      price?: number,
      sku?: string,
    ): Record<string, unknown> => {
      const p: Record<string, unknown> = {
        '@type': 'Product',
        name,
        category,
      }
      if (sku) p.sku = sku
      if (price) {
        p.offers = {
          '@type': 'Offer',
          price,
          priceCurrency: 'COP',
          seller: { '@id': `${SITE}/#organizacion` },
        }
      }
      return p
    }

    const lista = (name: string, items: Record<string, unknown>[]) => ({
      '@type': 'ItemList',
      name,
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, item })),
    })

    const catalog = lista(
      'Catálogo de motos eléctricas H&D MOTORENS',
      MOTOS.map((m) => producto(m.name, 'Moto eléctrica', m.price)),
    )

    const parts = lista(
      'Catálogo de repuestos H&D MOTORENS',
      REPUESTOS.map((r) => producto(r.name, r.category, r.price, r.sku)),
    )

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [org, catalog, parts],
    })
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
    // Se rehace cuando llegan los precios en vivo (ver src/lib/motos-live.tsx)
  }, [MOTOS, STATS])

  return null
}
