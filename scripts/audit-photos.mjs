/**
 * Estado de las fotos del catálogo: qué falta y qué conviene reemplazar.
 *
 * La clasificación de calidad está **revisada a ojo**, no detectada de forma
 * automática: se probó a medir el contraste de la banda central para cazar la
 * marca de agua y daba 50 falsos positivos de 63 (confundía el borde del
 * vehículo con el texto sobreimpreso). Con 74 modelos sale más fiable mirar
 * las hojas de contacto y anotar aquí el resultado.
 *
 * Para revisarlas de nuevo:
 *   node scripts/sheet-of.mjs salida.jpg <id> <id> …
 *
 *   node scripts/audit-photos.mjs
 */
import { leerCatalogo } from './audit.mjs'

/** Fotos con la dirección de la tienda de origen impresa encima */
const MARCA_DE_AGUA = new Set(['t3-aima', 'mak3-aima', 'a500-aima'])

/** Fotos tomadas en la calle, el local o el parqueadero, no en estudio */
const AMBIENTE = new Set(['trogon-aima', 'fisher-350-electrika', 't3-aima', 'mak3-aima'])

/** La foto muestra varias unidades a la vez: el modelo no se distingue */
const VARIOS_MODELOS = new Set([
  'ciclomotor-electrico-dakota-pro',
  'ciclomotor-electrico-vera-2026',
  'ciclomotor-electrico-verona',
])

/** El recorte del fondo dejó una mancha visible */
const RECORTE_SUCIO = new Set(['girl-3'])

/** Es un render de estudio con plataforma, no una foto de producto */
const RENDER = new Set(['a500-aima'])

const motivo = (id) =>
  [
    MARCA_DE_AGUA.has(id) && 'marca de agua',
    AMBIENTE.has(id) && 'foto de ambiente',
    VARIOS_MODELOS.has(id) && 'varios modelos en la foto',
    RECORTE_SUCIO.has(id) && 'recorte sucio',
    RENDER.has(id) && 'render, no foto',
  ]
    .filter(Boolean)
    .join(' + ')

const catalogo = leerCatalogo()
const sinFoto = catalogo.filter((m) => !m.image)
const mejorables = catalogo.filter((m) => m.image && motivo(m.image))
const correctas = catalogo.filter((m) => m.image && !motivo(m.image))

const precio = (m) => (m.price ? '$' + m.price.toLocaleString('es-CO') : 'sin precio')

/* --- Lista única, ordenada por urgencia --- */
if (process.argv.includes('--lista')) {
  const pendientes = [
    ...sinFoto.map((m) => ({ ...m, que: 'SIN FOTO' })),
    ...mejorables.map((m) => ({ ...m, que: motivo(m.image).toUpperCase() })),
  ].sort(
    (a, b) =>
      // Primero los que tienen precio propio (son los que se venden),
      // y dentro de cada grupo, el más caro arriba.
      Number(Boolean(b.price)) - Number(Boolean(a.price)) || (b.price ?? 0) - (a.price ?? 0),
  )

  console.log(`\nFOTOS PENDIENTES — ${pendientes.length} de ${catalogo.length} modelos\n`)
  console.log(`  #   MODELO                          PRECIO          PROVEEDOR    PROBLEMA`)
  console.log(`  ${'─'.repeat(94)}`)
  for (const [i, m] of pendientes.entries()) {
    console.log(
      `  ${String(i + 1).padStart(2)}  ${m.name.padEnd(30)}  ${precio(m).padStart(12)}  ` +
        `${(m.brand || '—').padEnd(11)}  ${m.que}`,
    )
  }
  console.log(
    `\n  Con precio tuyo: ${pendientes.filter((m) => m.price).length}  ·  Sin precio: ${pendientes.filter((m) => !m.price).length}`,
  )
  process.exit(0)
}

console.log(`\n════ 1. SIN FOTO — ${sinFoto.length} modelos (muestran silueta gris) ════\n`)
for (const m of sinFoto) {
  console.log(`  ${m.name.padEnd(26)} ${precio(m).padStart(12)}`)
}
console.log(`\n  Todos llevan TU precio, así que son los que más urge cubrir.`)

console.log(`\n════ 2. FOTO MEJORABLE — ${mejorables.length} modelos ════\n`)
for (const m of mejorables) {
  console.log(
    `  ${m.name.padEnd(34)} ${(m.brand || '—').padEnd(10)} ${precio(m).padStart(12)}   ${motivo(m.image)}`,
  )
}

console.log(`\n════ 3. CORRECTAS — ${correctas.length} modelos ════`)
console.log(`\nTOTAL ${catalogo.length}  ·  a cubrir ${sinFoto.length}  ·  a mejorar ${mejorables.length}`)
