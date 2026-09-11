/**
 * Saca las fotos de los repuestos del catálogo en PDF.
 *
 * El ZIP de fotos que menciona el Excel no llegó, pero el PDF las lleva
 * incrustadas. El catálogo abre cada producto con una página de ficha —nombre,
 * SKU y precio— y detrás pone una o varias páginas sueltas solo con fotos. Por
 * eso no vale mirar página a página: hay fichas sin ninguna imagen encima y su
 * foto está en la siguiente. Se recorre en orden arrastrando el producto activo
 * y se guarda la imagen más grande que aparezca hasta la ficha siguiente.
 *
 *   node scripts/extract-parts-photos.mjs [--max=N]
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import path from 'node:path'
import { archivoDeSku, slugNombre } from './sku.mjs'

const require = createRequire(import.meta.url)
const pdfjs = require('pdfjs-dist/legacy/build/pdf.mjs')

const PDF = 'C:/Users/Lenovo/Desktop/motors/Catalogo_Bicyrekkord_Repuestos.pdf'
const OUT = 'public/repuestos'
const SIZES = [{ w: 360, suf: '' }, { w: 720, suf: '@2x' }]
const MIN_PX = 220 // por debajo de esto son iconos o adornos de la maqueta

const max = Number(process.argv.find((a) => a.startsWith('--max='))?.split('=')[1]) || Infinity
mkdirSync(OUT, { recursive: true })

const doc = await pdfjs.getDocument({ url: PDF, disableFontFace: true }).promise
const encontrados = new Map()

/**
 * ¿Es la ficha de un producto? Solo esas llevan "Precio:" detrás del nombre;
 * las páginas de fotos sueltas empiezan por "Foto 2 · 875x875 px · …" y no
 * deben abrir un producto nuevo.
 */
const fichaDe = (texto) => {
  const m = texto.match(/^\s*(.{3,140}?)\s+Bicyrekkord\s+·\s+[^·]{0,60}?Precio:/)
  if (!m) return null
  // Ojo con la Ñ (RKPÑ004) y con el sufijo -1: sin ellos el SKU no casa con el
  // Excel y la foto se pierde aunque esté en el PDF.
  const sku = texto.match(/\bRK[A-ZÑ0-9]{3,10}(?:-\d)?\b/)?.[0]
  // Una referencia del proveedor viene sin SKU (la batería de 27AH): para esa
  // el nombre hace de clave, y el generador la busca igual.
  return { clave: sku ? archivoDeSku(sku) : slugNombre(m[1]), page: 0 }
}

let actual = null

for (let n = 1; n <= doc.numPages && encontrados.size < max; n++) {
  const page = await doc.getPage(n)
  const texto = (await page.getTextContent()).items.map((i) => i.str).join(' ')

  const ficha = fichaDe(texto)
  if (ficha) {
    actual = encontrados.get(ficha.clave) ?? { page: n, img: null }
    encontrados.set(ficha.clave, actual)
  }

  // Sin producto activo (portada, índice) no hay a quién asignar la imagen
  if (!actual) {
    page.cleanup()
    continue
  }

  const ops = await page.getOperatorList()

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue
    const nombre = ops.argsArray[i][0]
    try {
      const img = await new Promise((res, rej) => {
        // El objeto puede no estar resuelto todavía
        try {
          page.objs.get(nombre, res)
        } catch (e) {
          rej(e)
        }
      })
      if (!img?.width || img.width < MIN_PX || img.height < MIN_PX) continue
      const area = img.width * img.height
      if (!actual.img || area > actual.img.width * actual.img.height) actual.img = img
    } catch {
      /* imagen ilegible: siguiente */
    }
  }

  page.cleanup()
}

// Los productos cuya ficha y páginas siguientes no traían ninguna imagen
for (const [clave, v] of encontrados) if (!v.img) encontrados.delete(clave)

console.error(`productos con foto: ${encontrados.size}`)

const report = []
for (const [clave, { img, page }] of encontrados) {
  try {
    // pdf.js entrega RGBA o RGB crudo según cómo esté guardada la imagen
    const canales = img.data.length / (img.width * img.height)
    if (canales !== 3 && canales !== 4) {
      report.push({ sku: clave, error: `formato raro (${canales} canales)` })
      continue
    }

    const base = await sharp(Buffer.from(img.data), {
      raw: { width: img.width, height: img.height, channels: canales },
    })
      .flatten({ background: '#ffffff' })
      .trim({ threshold: 8 })
      .png()
      .toBuffer()

    for (const { w, suf } of SIZES) {
      await sharp(base)
        .resize(w, w, { fit: 'contain', background: '#ffffff' })
        .webp({ quality: 84 })
        .toFile(path.join(OUT, `${clave}${suf}.webp`))
    }
    report.push({ sku: clave, page, size: `${img.width}x${img.height}` })
  } catch (e) {
    report.push({ sku: clave, error: String(e.message).slice(0, 70) })
  }
}

mkdirSync('scripts/data', { recursive: true })
writeFileSync(
  'scripts/data/repuestos-fotos.json',
  JSON.stringify(
    report.filter((r) => !r.error).map((r) => r.sku),
    null,
    1,
  ),
)
console.log(JSON.stringify(report.filter((r) => r.error).slice(0, 10), null, 1))
console.error(`exportadas ${report.filter((r) => !r.error).length} / ${report.length}`)
