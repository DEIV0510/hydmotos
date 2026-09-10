// ⚠️ ARCHIVO GENERADO — no editar a mano.
//    Se construye con `npm run catalog`, que cruza:
//      · la lista de precios que envió el cliente (manda sobre el resto),
//      · el Excel de descripciones de la carpeta Motors,
//      · las fotos ya procesadas en public/motos.
//    Para cambiar un precio o una ficha, edita CLIENTE en
//    scripts/build-catalog.mjs y vuelve a ejecutar el script.

import type { MotoVariant } from '@/components/art/MotoArt'

export type Battery = 'Grafeno' | 'Litio'
export type CategoryId = 'urbana' | 'familiar' | 'matricula' | 'tricimotor'

export type Moto = {
  id: string
  name: string
  category: CategoryId
  /** Silueta vectorial de respaldo cuando no hay foto */
  art: MotoVariant

  /** Precio en COP. Sin precio ⇒ la tarjeta muestra "Precio por WhatsApp" */
  price?: number
  /** Precio anterior: su presencia activa el badge de oferta */
  oldPrice?: number

  /** Nombre del archivo en public/motos (sin extensión) */
  image?: string
  /**
   * Cómo encuadrar la foto. Por omisión va recortada sobre el fondo de la
   * tarjeta; 'cover' es para las fotos de ambiente (calle, parqueadero),
   * que llenan el marco porque no se pueden recortar.
   */
  photoFit?: 'cover'
  description?: string
  colors?: string[]

  range?: number
  speed?: number
  power?: number

  battery: Battery
  capacity?: string
  brakes?: string
  charge?: string
  tire: string
  mirrors: string
  bikeLane: string
  turnSignals: string

  alarm: boolean
  pedals: boolean
  led: boolean
  stop: boolean
  parkingLights: boolean
  soat: boolean
  matricula: boolean
  tecnomecanica: boolean
  reverse?: boolean

  /** De dónde salieron los datos: 'cliente' tiene precio propio verificado */
  source: 'cliente' | 'excel'
}
