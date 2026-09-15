// ⚠️ ARCHIVO GENERADO — no editar a mano.
//    Se construye con `npm run catalog`, que cruza:
//      · la lista de precios que envió el cliente (manda sobre el resto),
//      · el Excel de descripciones de la carpeta Motors,
//      · las fotos ya procesadas en public/motos.
//    Para cambiar un precio o una ficha, edita CLIENTE en
//    scripts/build-catalog.mjs y vuelve a ejecutar el script.

import type { MotoVariant } from '@/components/art/MotoArt'

export type CategoryId = 'urbana' | 'familiar' | 'matricula' | 'tricimotor'

export type Moto = {
  id: string
  name: string
  category: CategoryId
  /** Silueta vectorial de respaldo (ya no se dibuja; se conserva el dato) */
  art: MotoVariant

  /** Precio en COP. Sin precio ⇒ la tarjeta muestra "Precio por WhatsApp" */
  price?: number
  /** Precio anterior: su presencia activa el badge de oferta */
  oldPrice?: number

  /** Nombre del archivo en public/motos (sin extensión) */
  image?: string
  /**
   * Cómo encuadrar la foto. Por omisión va recortada, en un lienzo cuadrado,
   * sobre el fondo de la tarjeta. 'cover' es una foto entera (calle, local o
   * fondo de color de estudio) exportada ya en el marco 4:3 de las tarjetas.
   */
  photoFit?: 'cover'
  /**
   * Proporción ancho/alto que encuadra solo el vehículo dentro de su foto
   * recortada. Las fotos van en un lienzo cuadrado y una moto de perfil ocupa
   * poco más de la mitad del alto: con object-cover y este aspect-ratio se ve
   * entera, sin las franjas transparentes. Lo mide `npm run catalog`.
   */
  photoAspect?: number
  description?: string
  colors?: string[]
  /**
   * Ficha técnica completa tal y como la publica el proveedor. Algunas traen
   * 40 campos (suspensión, tablero, reversa…) y otras ninguno.
   */
  sheet?: { label: string; value: string }[]

  range?: number
  speed?: number
  power?: number

  /**
   * Batería. En los modelos del cliente, «Grafeno» o «Litio»; en los del
   * Excel, el texto del proveedor ("60V: Plomo de grafeno"). Vacío = sin dato.
   */
  battery?: string
  capacity?: string
  brakes?: string
  charge?: string
  /** Vacíos cuando el modelo no los declara: no se muestran */
  tire?: string
  mirrors?: string
  bikeLane?: string
  turnSignals?: string

  alarm: boolean
  pedals: boolean
  led: boolean
  stop: boolean
  parkingLights: boolean
  soat: boolean
  matricula: boolean
  tecnomecanica: boolean
  reverse?: boolean

  /** Tienda o marca de origen del material (Evobike, Biologica, MAGMA…) */
  brand?: string

  /**
   * De dónde salieron los datos: 'cliente' tiene precio y ficha propios;
   * 'excel', la ficha del proveedor; 'nuevo', solo nombre y foto.
   */
  source: 'cliente' | 'excel' | 'nuevo'
}
