/**
 * Genera src/data/repuestos.ts cruzando el Excel de Bicyrekkord con las fotos
 * extraídas del catálogo en PDF.
 *
 *   node scripts/build-parts.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { archivoDeSku, slugNombre } from './sku.mjs'

const excel = JSON.parse(readFileSync('scripts/data/repuestos-excel.json', 'utf8'))

/** Icono por categoría, del set propio */
const ICONO = {
  'Sistema de frenado': 'brake',
  'Cables y Conectores': 'plug',
  Misceláneos: 'tools',
  Aceleradores: 'dash',
  'Motor y Componentes': 'bolt',
  'Bombillos y Flashers': 'light',
  'Corazas y Neumáticos': 'tire',
  'Controladores y Convertidores': 'dash',
  Cargadores: 'plug',
  Baterías: 'battery',
}

const q = (s) => JSON.stringify(s ?? '')
const money = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_')

const usados = new Set()
const partes = []

for (const p of excel) {
  // Un id estable: el SKU cuando existe, y si no el nombre
  let id = (p.sku || slugNombre(p.nombre)).toLowerCase()
  while (usados.has(id)) id += '-b'
  usados.add(id)

  // Las que no traen SKU se buscan por el nombre, igual que las guarda el
  // extractor de fotos del PDF.
  const archivo = p.sku ? archivoDeSku(p.sku) : slugNombre(p.nombre)
  const foto = existsSync(`public/repuestos/${archivo}.webp`) ? archivo : null

  partes.push({
    id,
    sku: p.sku,
    name: p.nombre,
    category: p.categoria,
    sub: p.subcategoria,
    icon: ICONO[p.categoria] ?? 'tools',
    price: p.precio,
    // Solo cuenta como oferta si el precio regular es mayor de verdad
    oldPrice: p.enOferta && p.precioRegular > p.precio ? p.precioRegular : null,
    image: foto,
    description: p.descripcion,
    specs: p.atributos.slice(0, 6),
    available: p.disponible,
  })
}

/**
 * El Excel viene agrupado por categoría, así que la primera página de "Todas"
 * salían ocho aceleradores casi idénticos. Se intercalan por rondas: una pieza
 * de cada categoría, luego la siguiente. Dentro de cada categoría se respeta el
 * orden del proveedor, así que filtrar por categoría se ve igual que en su
 * catálogo. Las que tienen foto van primero en su grupo.
 */
const porCategoria = new Map()
for (const p of partes) {
  if (!porCategoria.has(p.category)) porCategoria.set(p.category, [])
  porCategoria.get(p.category).push(p)
}
const grupos = [...porCategoria.values()]
  .map((g) => [...g].sort((a, b) => Boolean(b.image) - Boolean(a.image)))
  .sort((a, b) => b.length - a.length)

const ordenadas = []
for (let i = 0; ordenadas.length < partes.length; i++) {
  for (const g of grupos) if (g[i]) ordenadas.push(g[i])
}

const body = ordenadas
  .map((p) => {
    const l = [`    id: ${q(p.id)}`, `    name: ${q(p.name)}`, `    category: ${q(p.category)}`]
    if (p.sub) l.push(`    sub: ${q(p.sub)}`)
    if (p.sku) l.push(`    sku: ${q(p.sku)}`)
    l.push(`    icon: ${q(p.icon)}`)
    if (p.price) l.push(`    price: ${money(p.price)}`)
    if (p.oldPrice) l.push(`    oldPrice: ${money(p.oldPrice)}`)
    if (p.image) l.push(`    image: ${q(p.image)}`)
    if (p.description) l.push(`    description: ${q(p.description)}`)
    if (p.specs.length) l.push(`    specs: ${JSON.stringify(p.specs)}`)
    if (!p.available) l.push(`    available: false`)
    return `  {\n${l.join(',\n')},\n  }`
  })
  .join(',\n')

const header = readFileSync('scripts/parts-header.ts', 'utf8')
const footer = readFileSync('scripts/parts-footer.ts', 'utf8')
writeFileSync('src/data/repuestos.ts', `${header}\nexport const REPUESTOS: Repuesto[] = [\n${body},\n]\n\n${footer}`)

const conFoto = partes.filter((p) => p.image).length
console.log(
  `${partes.length} repuestos · ${conFoto} con foto · ${partes.filter((p) => p.oldPrice).length} en oferta`,
)
