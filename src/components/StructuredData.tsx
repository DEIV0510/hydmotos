import { useEffect } from 'react'
import { MOTOS } from '@/data/motos'
import { REPUESTOS } from '@/data/repuestos'
import { ADDRESS, EMAIL, PHONE, SOCIAL, WHATSAPP_NUMBER } from '@/data/site'

const SITE = 'https://hdmotorens.com'

/**
 * Datos estructurados schema.org.
 * Se generan desde el catálogo real, así que los precios del buscador
 * siempre coinciden con los de la web. Solo se declaran los campos de
 * contacto que estén configurados en site.ts: nada inventado.
 */
export default function StructuredData() {
  useEffect(() => {
    const org: Record<string, unknown> = {
      '@type': 'AutoDealer',
      '@id': `${SITE}/#organizacion`,
      name: 'H&D MOTORENS',
      description:
        'Venta de motos eléctricas y repuestos: baterías de grafeno, autonomía de hasta 90 km, modelos sin requisito de SOAT ni matrícula, y catálogo de repuestos para vehículos eléctricos.',
      url: SITE,
      image: `${SITE}/og.svg`,
      priceRange: '$$',
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
        brand: { '@type': 'Brand', name: 'H&D MOTORENS' },
        category,
      }
      if (sku) p.sku = sku
      if (price) {
        p.offers = {
          '@type': 'Offer',
          price,
          priceCurrency: 'COP',
          availability: 'https://schema.org/InStock',
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
  }, [])

  return null
}
