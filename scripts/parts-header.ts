// ⚠️ ARCHIVO GENERADO — no editar a mano.
//    Se construye con `npm run parts`, que cruza el Excel de repuestos de la
//    carpeta Motors con las fotos extraídas del catálogo en PDF.
//    Para cambiar un precio, edítalo en el Excel y vuelve a ejecutarlo.

export type Repuesto = {
  id: string
  name: string
  category: string
  /** Subcategoría del proveedor; muchas van vacías */
  sub?: string
  /** Referencia del proveedor, útil para pedir la pieza exacta */
  sku?: string
  /** Icono del set propio: ver src/components/art/Icons.tsx */
  icon: 'battery' | 'plug' | 'tire' | 'brake' | 'shock' | 'light' | 'dash' | 'tools' | 'bolt'

  /** Precio en COP */
  price?: number
  /** Precio regular cuando está en oferta */
  oldPrice?: number

  /** Nombre del archivo en public/repuestos (sin extensión) */
  image?: string
  description?: string
  /** Atributos de la ficha del proveedor */
  specs?: { label: string; value: string }[]
  /** Por omisión true; solo se marca cuando el proveedor lo da por agotado */
  available?: boolean
}
