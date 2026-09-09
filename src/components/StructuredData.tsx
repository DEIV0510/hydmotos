import { useEffect } from 'react'
import { MOTOS } from '@/data/motos'
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
        'Venta de motos eléctricas: baterías de grafeno, autonomía de hasta 90 km y modelos sin requisito de SOAT ni matrícula.',
      url: SITE,
      image: `${SITE}/og.svg`,
      priceRange: '$$',
    }
    if (PHONE || WHATSAPP_NUMBER) org.telephone = PHONE || `+${WHATSAPP_NUMBER}`
    if (EMAIL) org.email = EMAIL
    if (ADDRESS) org.address = { '@type': 'PostalAddress', streetAddress: ADDRESS, addressCountry: 'CO' }
    const sameAs = Object.values(SOCIAL).filter(Boolean)
    if (sameAs.length) org.sameAs = sameAs

    const catalog = {
      '@type': 'ItemList',
      name: 'Catálogo de motos eléctricas H&D MOTORENS',
      numberOfItems: MOTOS.length,
      itemListElement: MOTOS.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: m.name,
          brand: { '@type': 'Brand', name: 'H&D MOTORENS' },
          category: 'Moto eléctrica',
          offers: {
            '@type': 'Offer',
            price: m.price,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    }

    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [org, catalog] })
    document.head.appendChild(el)
    return () => {
      el.remove()
    }
  }, [])

  return null
}
