/**
 * Nombre de archivo a partir del SKU del proveedor.
 *
 * Dos detalles tienen que sobrevivir para que la foto case con el Excel: la Ñ
 * de "RKPÑ004" y el sufijo "-1" con el que desempatan referencias repetidas.
 * La Ñ no se deja en una URL, así que se pasa a N.
 *
 * Vive aparte porque lo usan el extractor de fotos y el generador del catálogo.
 */
export const archivoDeSku = (sku) =>
  sku
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/**
 * Clave alterna para las referencias que el proveedor dejó sin SKU (hay una,
 * la batería de 27AH): el nombre del producto convertido a slug. Se usa igual
 * en el extractor —que lo lee del título de la página del PDF— y en el
 * generador —que lo lee del Excel—, así que la foto acaba encontrándose.
 */
export const slugNombre = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
