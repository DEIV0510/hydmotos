/**
 * Genera src/data/motos.ts cruzando tres fuentes:
 *
 *  1. La lista de precios que envió el cliente (manda sobre todo lo demás).
 *  2. El Excel de descripciones, con ficha técnica, colores y fotos.
 *  3. Las fotos ya procesadas en public/motos.
 *
 * Los modelos que no están en la lista del cliente se publican SIN precio
 * ("Precio por WhatsApp"): no se inventa ninguno ni se copia el de la tienda
 * de origen.
 *
 *   node scripts/build-catalog.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'


const crudo = JSON.parse(readFileSync('scripts/data/excel.json', 'utf8'))

/** Encuadre de cada foto: 'recorte' (transparente) o 'ambiente' (llena el marco) */
const MODOS = existsSync('scripts/data/photo-modes.json')
  ? JSON.parse(readFileSync('scripts/data/photo-modes.json', 'utf8'))
  : {}

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const norm = (s) =>
  s.toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Z0-9]/g, '')

/* ---------------------------------------------------------------- */
/*  1. Precios y ficha del cliente (los 19 que envió por escrito)     */
/* ---------------------------------------------------------------- */

const base = {
  mirrors: 'De lujo', tire: 'Sello Matic', bikeLane: 'Sí, máximo 25 km/h',
  turnSignals: 'Delanteras y traseras', alarm: true, stop: true,
  soat: false, matricula: false, tecnomecanica: false,
}

const CLIENTE = [
  { id: 'urban', name: 'URBAN', price: 3_300_000, range: 35, speed: 40, power: 350, battery: 'Grafeno', capacity: '130 kg', brakes: 'Delantero y trasero, banda', pedals: true, led: true, parkingLights: false, art: 'scooter', category: 'urbana' },
  { id: 'zeus', name: 'ZEUS', price: 4_000_000, range: 55, speed: 40, power: 350, battery: 'Grafeno', capacity: '150 kg', brakes: 'Delantero de disco y trasero', pedals: true, led: true, parkingLights: false, art: 'street', category: 'urbana' },
  { id: 'urbex', name: 'URBEX', price: 4_070_000, range: 55, speed: 40, power: 350, battery: 'Grafeno', capacity: '150 kg', brakes: 'Delantero de disco y trasero de banda', pedals: true, led: true, parkingLights: false, art: 'street', category: 'urbana' },
  { id: 'reina', name: 'REINA', price: 3_700_000, range: 40, speed: 40, power: 350, battery: 'Grafeno', capacity: '150 kg', brakes: 'Delantero de disco y trasero de banda', pedals: true, led: true, parkingLights: false, art: 'scooter', category: 'urbana' },
  { id: 'family-q', name: 'FAMILY Q', price: 4_720_000, range: 50, speed: 35, power: 550, battery: 'Grafeno', capacity: '2 personas', brakes: 'Delantero y trasero, banda', pedals: false, led: true, parkingLights: true, art: 'scooter', category: 'familiar' },
  { id: 'moped', name: 'MOPED', price: 3_200_000, range: 65, speed: 50, power: 550, battery: 'Grafeno', capacity: '2 personas', brakes: 'Delantero y trasero, banda', pedals: true, led: true, parkingLights: false, art: 'street', category: 'urbana' },
  { id: 'family-plus-5420', name: 'FAMILY PLUS', price: 5_420_000, range: 55, speed: 35, power: 350, battery: 'Grafeno', capacity: '2 personas', brakes: 'Delantero y trasero, banda', pedals: false, led: true, parkingLights: true, art: 'scooter', category: 'familiar' },
  { id: 'motorens', name: 'MOTORENS', price: 2_400_000, oldPrice: 2_700_000, range: 60, speed: 60, power: 400, battery: 'Grafeno', capacity: '2 personas / 180 kg', brakes: 'Delantero y trasero, banda', pedals: true, led: true, parkingLights: true, art: 'street', category: 'urbana' },
  { id: 'biwi-electrica', name: 'BIWI ELÉCTRICA', price: 8_000_000, oldPrice: 8_500_000, range: 90, speed: 88, power: 1800, battery: 'Grafeno', capacity: '3 personas / 290 kg', brakes: 'Delantero y trasero, disco', pedals: false, led: true, parkingLights: true, reverse: true, soat: true, matricula: true, tecnomecanica: true, bikeLane: 'No', art: 'sport', category: 'matricula' },
  { id: 'classic-run', name: 'CLASSIC RUN', price: 4_500_000, oldPrice: 5_000_000, range: 70, speed: 75, power: 1000, battery: 'Grafeno', capacity: '2 personas / 240 kg', brakes: 'Disco delantero y banda trasera', pedals: false, led: true, parkingLights: true, soat: true, matricula: true, tecnomecanica: true, art: 'street', category: 'matricula' },
  { id: 'ryder-pro', name: 'RYDER PRO', price: 4_100_000, range: 65, speed: 50, power: 350, battery: 'Grafeno', capacity: '2 personas', brakes: 'Disco delantero y banda trasera', pedals: false, led: true, parkingLights: true, art: 'street', category: 'urbana' },
  { id: 'tigre', name: 'TIGRE', price: 4_000_000, range: 65, speed: 50, power: 350, battery: 'Grafeno', capacity: '2 personas', brakes: 'Disco delantero y banda trasera', pedals: true, led: true, parkingLights: true, art: 'trail', category: 'urbana' },
  { id: 'polar', name: 'POLAR', price: 4_000_000, range: 65, speed: 50, power: 350, battery: 'Grafeno', capacity: '2 personas', brakes: 'Disco delantero y banda trasera', pedals: true, led: true, parkingLights: true, art: 'street', category: 'urbana' },
  { id: 'magma-neva', name: 'MAGMA NEVA', price: 4_480_000, range: 65, speed: 50, power: 350, battery: 'Grafeno', capacity: '2 personas', brakes: 'Disco delantero y banda trasera', pedals: true, led: true, parkingLights: true, art: 'trail', category: 'urbana' },
  { id: 'family', name: 'FAMILY', price: 4_400_000, range: 65, speed: 50, power: 550, battery: 'Grafeno', capacity: '2 personas', brakes: 'Delantero y trasero, banda', pedals: false, led: true, parkingLights: true, art: 'scooter', category: 'familiar' },
  { id: 'family-plus-5200', name: 'FAMILY PLUS', price: 5_200_000, range: 65, speed: 50, power: 550, battery: 'Grafeno', capacity: '2 personas', brakes: 'Delantero y trasero, banda', pedals: false, led: true, parkingLights: true, art: 'scooter', category: 'familiar' },
  { id: 'cielo', name: 'CIELO', price: 3_700_000, range: 45, speed: 40, power: 550, battery: 'Litio', capacity: '2 personas', brakes: 'Delantero y trasero, disco', mirrors: 'No', pedals: true, led: false, parkingLights: false, art: 'scooter', category: 'urbana' },
  { id: 'tricimotor-electrico', name: 'TRICIMOTOR ELÉCTRICO', price: 5_990_000, oldPrice: 6_500_000, range: 65, speed: 40, power: 400, battery: 'Grafeno', capacity: '2 personas / 240 kg', brakes: 'Delantero y trasero, disco', pedals: false, led: true, parkingLights: true, art: 'trike', category: 'tricimotor' },
  { id: 'beetle', name: 'BEETLE', price: 4_600_000, range: 65, speed: 50, power: 550, battery: 'Grafeno', capacity: '2 personas', brakes: 'Disco delantero y banda trasera', pedals: true, led: true, parkingLights: true, art: 'scooter', category: 'familiar' },
]

/**
 * Nombre del Excel que corresponde a cada modelo del cliente (foto y
 * descripción). Solo los que la tienda vende con el mismo nombre.
 *
 * El TRICIMOTOR ELÉCTRICO iba emparejado con «Trimotos C1 Tyson» de Mobulaa y
 * no es el mismo vehículo: la C1 tiene 650 W, 25–35 km/h y 300 kg, pide
 * licencia, SOAT y matrícula y cuesta $8.875.000; el del cliente, 400 W,
 * 40 km/h, 240 kg, sin matrícula y $5.990.000. Se quitó el 2026-09-15: el
 * tricimotor queda con «Foto pendiente» y la C1 sale aparte, sin precio.
 */
const FOTO_DE = {
  urban: 'Urban', urbex: 'Urbex', reina: 'Reina', moped: 'Moped',
  'ryder-pro': 'Ryder Pro', tigre: 'Tigre', polar: 'Polar',
}

/* ---------------------------------------------------------------- */
/*  2. Categoría y silueta de respaldo para los modelos del Excel     */
/* ---------------------------------------------------------------- */

function clasificar(m) {
  const t = `${m.nombre} ${m.descripcion} ${m.specs.capacidad}`.toLowerCase()
  if (/trimoto|tricimoto|triciclo|c1 tyson/.test(t)) return { category: 'tricimotor', art: 'trike' }
  if (m.specs.velocidadKmh >= 60 || (m.specs.potenciaW ?? 0) >= 1000) return { category: 'matricula', art: 'sport' }
  if (/2 persona|familiar|baúl|baul/.test(t) && (m.specs.potenciaW ?? 0) >= 500) return { category: 'familiar', art: 'scooter' }
  return { category: 'urbana', art: 'street' }
}

/** Colores del campo "Opciones" del Excel */
function colores(opciones) {
  const m = String(opciones).match(/Color(?:es)?\s*:\s*([^\n]+)/i)
  if (!m) return []
  return m[1]
    .split(/,(?![^(]*\))/)
    .map((c) => c.trim().replace(/\.$/, ''))
    .filter((c) => c && c.length < 26)
}

/* ---------------------------------------------------------------- */
/*  3. Construcción                                                   */
/* ---------------------------------------------------------------- */

const porNombre = new Map(crudo.map((m) => [norm(m.nombre), m]))
const usados = new Set()
const motos = []

// -- Modelos del cliente: su precio y su ficha mandan
for (const c of CLIENTE) {
  const fuente = FOTO_DE[c.id] ? porNombre.get(norm(FOTO_DE[c.id])) : null
  if (fuente) usados.add(norm(fuente.nombre))
  /**
   * La descripción y la ficha de la tienda solo se usan si sus cifras cuadran
   * con las del cliente. En REINA, MOPED, RYDER PRO, TIGRE y POLAR no cuadran
   * (MOPED: 350 W, 38 km/h y 55 km en la tienda; 550 W, 50 km/h y 65 km en la
   * lista) y la ficha acababa diciendo lo contrario que la tarjeta. La foto sí
   * se usa: es el modelo que la tienda vende con ese mismo nombre.
   */
  const cuadra =
    fuente &&
    [['autonomiaKm', 'range'], ['velocidadKmh', 'speed'], ['potenciaW', 'power']].every(
      ([t, k]) => !fuente.specs[t] || !c[k] || fuente.specs[t] === c[k],
    )
  const ficha = cuadra ? fuente : null
  const id = c.id
  // La foto se busca por la carpeta del Excel y, si el modelo no tiene
  // carpeta, por su propio id: así aparecen las de build-extra-photos
  // (zeus.webp, classic-run.webp…).
  const archivo = FOTO_DE[c.id] ? slug(FOTO_DE[c.id]) : id
  const img = existsSync(`public/motos/${archivo}.webp`) ? archivo : null
  motos.push({
    ...base, ...c,
    image: img,
    description: ficha?.descripcion || '',
    colors: fuente ? colores(fuente.opciones) : [],
    charge: ficha?.specs.carga || '',
    sheet: ficha?.detalle ?? [],
    brand: fuente?.proveedor ?? '',
    source: 'cliente',
  })
}

// -- Resto del Excel: sin precio
for (const m of crudo) {
  if (usados.has(norm(m.nombre))) continue
  if (/^(azul|blanco|negro|banners)$/i.test(m.nombre)) continue
  const { category, art } = clasificar(m)
  const id = slug(m.nombre)
  motos.push({
    // Sin `...base`: esos valores comunes (espejos de lujo, llanta Sello
    // Matic…) son de la ficha del cliente, no de estos modelos, y se colaban
    // en su ficha técnica.
    id, name: m.nombre.toUpperCase(), category, art,
    price: null,
    range: m.specs.autonomiaKm, speed: m.specs.velocidadKmh, power: m.specs.potenciaW,
    // Tal y como la escribe el proveedor ("48V: Ácido de plomo"). Antes todo
    // lo que no decía «litio» salía como grafeno, también las de plomo.
    battery: m.specs.bateriaTxt ? String(m.specs.bateriaTxt).trim() : '',
    capacity: m.specs.capacidad || '', brakes: m.specs.frenos || '',
    tire: m.specs.llantas || '',
    charge: m.specs.carga || '',
    sheet: m.detalle ?? [],
    brand: m.proveedor,
    image: existsSync(`public/motos/${id}.webp`) ? id : null,
    description: m.descripcion,
    colors: colores(m.opciones),
    pedals: /pedal/i.test(m.ficha), led: /led/i.test(m.ficha), parkingLights: false,
    alarm: false, stop: false, soat: false, matricula: false, tecnomecanica: false,
    source: 'excel',
  })
}

/**
 * Modelos nuevos de la carpeta Motors (2026-09-15) que no están ni en la lista
 * del cliente ni en el Excel. El nombre se leyó en el propio vehículo o en el
 * banner de la marca (ver build-extra-photos.mjs). No hay precio ni ficha
 * técnica: la tarjeta muestra «Precio por WhatsApp» y ninguna cifra.
 */
const NUEVOS = [
  { id: 'magma-bubble', name: 'MAGMA BUBBLE', brand: 'MAGMA' },
  { id: 'magma-q2-boxter', name: 'MAGMA Q2 BOXTER', brand: 'MAGMA' },
  { id: 'magma-x1', name: 'MAGMA X1', brand: 'MAGMA' },
  { id: 'magma-one', name: 'MAGMA ONE', brand: 'MAGMA' },
  { id: 'x-baw', name: 'X.BAW', brand: '' },
]
for (const n of NUEVOS) {
  motos.push({
    id: n.id, name: n.name, category: 'urbana', art: 'street',
    price: null,
    image: existsSync(`public/motos/${n.id}.webp`) ? n.id : null,
    battery: '', tire: '',
    description: '', colors: [], sheet: [],
    alarm: false, pedals: false, led: false, stop: false, parkingLights: false,
    soat: false, matricula: false, tecnomecanica: false,
    brand: n.brand,
    source: 'nuevo',
  })
}

/* ---------------------------------------------------------------- */
/*  4. Volcado a TypeScript                                           */
/* ---------------------------------------------------------------- */

/**
 * Encuadre de las fotos recortadas.
 *
 * build-photos.mjs exporta cada vehículo centrado en un lienzo cuadrado. Una
 * moto de perfil ocupa poco más de la mitad del alto, así que mostrada entera
 * arrastra dos franjas transparentes: en la portada dejaban 110 px vacíos bajo
 * las ruedas. Aquí se mide el alto real por el canal alfa y se guarda la
 * proporción ancho/alto que encuadra solo la moto, con un margen; con
 * object-cover y ese aspect-ratio se ve entera y sin el aire.
 *
 * Solo vale porque el vehículo va centrado en vertical (gravity center en
 * build-photos). Comprobado en las 52 fotos: el peor caso se desvía 1 px de 900.
 */
const { default: sharp } = await import('sharp')
const MARGEN = 0.03 // del alto del lienzo, para que la moto no roce el borde

for (const m of motos) {
  if (!m.image || MODOS[m.image] === 'ambiente') continue
  const { data, info } = await sharp(`public/motos/${m.image}@2x.webp`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const filaConMoto = (y) => {
    for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 16) return true
    return false
  }
  let arriba = 0
  while (arriba < info.height && !filaConMoto(arriba)) arriba++
  if (arriba >= info.height) continue
  let abajo = info.height - 1
  while (abajo > arriba && !filaConMoto(abajo)) abajo--

  const visible = abajo - arriba + 1 + 2 * Math.round(MARGEN * info.height)
  const aspecto = Math.min(2.2, info.width / visible)
  // Si la moto ya llena el cuadrado no hay aire que quitar
  if (aspecto > 1.02) m.photoAspect = Number(aspecto.toFixed(3))
}

const q = (s) => JSON.stringify(s ?? '')
const money = (n) => (n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '_') : 'undefined')

const body = motos
  .map((m) => {
    const l = [`    id: ${q(m.id)}`, `    name: ${q(m.name)}`, `    category: ${q(m.category)}`, `    art: ${q(m.art)}`]
    if (m.price) l.push(`    price: ${money(m.price)}`)
    if (m.oldPrice) l.push(`    oldPrice: ${money(m.oldPrice)}`)
    if (m.image) {
      l.push(`    image: ${q(m.image)}`)
      if (MODOS[m.image] === 'ambiente') l.push(`    photoFit: ${q('cover')}`)
      if (m.photoAspect) l.push(`    photoAspect: ${m.photoAspect}`)
    }
    if (m.description) l.push(`    description: ${q(m.description)}`)
    if (m.colors?.length) l.push(`    colors: ${JSON.stringify(m.colors)}`)
    if (m.sheet?.length) l.push(`    sheet: ${JSON.stringify(m.sheet)}`)
    if (m.range) l.push(`    range: ${m.range}`)
    if (m.speed) l.push(`    speed: ${m.speed}`)
    if (m.power) l.push(`    power: ${m.power}`)
    l.push(`    battery: ${q(m.battery)}`)
    if (m.capacity) l.push(`    capacity: ${q(m.capacity)}`)
    if (m.brakes) l.push(`    brakes: ${q(m.brakes)}`)
    if (m.charge) l.push(`    charge: ${q(m.charge)}`)
    l.push(`    tire: ${q(m.tire)}`, `    mirrors: ${q(m.mirrors)}`, `    bikeLane: ${q(m.bikeLane)}`, `    turnSignals: ${q(m.turnSignals)}`)
    for (const k of ['alarm', 'pedals', 'led', 'stop', 'parkingLights', 'soat', 'matricula', 'tecnomecanica']) {
      l.push(`    ${k}: ${Boolean(m[k])}`)
    }
    if (m.reverse !== undefined) l.push(`    reverse: ${m.reverse}`)
    if (m.brand) l.push(`    brand: ${q(m.brand)}`)
    l.push(`    source: ${q(m.source)}`)
    return `  {\n${l.join(',\n')},\n  }`
  })
  .join(',\n')

const header = readFileSync('scripts/motos-header.ts', 'utf8')
writeFileSync('src/data/motos.ts', `${header}\nexport const MOTOS: Moto[] = [\n${body},\n]\n\n${readFileSync('scripts/motos-footer.ts', 'utf8')}`)

const conPrecio = motos.filter((m) => m.price).length
const conFoto = motos.filter((m) => m.image).length
console.log(`${motos.length} modelos · ${conPrecio} con precio · ${conFoto} con foto real`)
