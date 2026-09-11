/**
 * Auditoría del catálogo: qué está completo y qué falta.
 * Lee el motos.ts generado sin necesidad de compilar TypeScript.
 *
 *   node scripts/audit.mjs           → resumen
 *   node scripts/audit.mjs --sinfoto → solo los modelos sin foto
 */
import { readFileSync } from 'node:fs'

const src = readFileSync('src/data/motos.ts', 'utf8')
const cuerpo = src.slice(src.indexOf('export const MOTOS'))

/** Divide el array en bloques de modelo y lee sus campos */
export function leerCatalogo() {
  const bloques = cuerpo.split(/\n {2}\{\n/).slice(1)
  return bloques
    .map((b) => {
      const campo = (k) => {
        const m = b.match(new RegExp(`^ {4}${k}: (.+?),$`, 'm'))
        if (!m) return undefined
        const v = m[1].trim()
        if (v === 'true') return true
        if (v === 'false') return false
        if (v.startsWith('"')) return v.slice(1, -1)
        if (v.startsWith('[')) return JSON.parse(v)
        return Number(v.replace(/_/g, ''))
      }
      return {
        id: campo('id'),
        name: campo('name'),
        category: campo('category'),
        price: campo('price'),
        image: campo('image'),
        photoFit: campo('photoFit'),
        description: campo('description'),
        colors: campo('colors'),
        range: campo('range'),
        speed: campo('speed'),
        power: campo('power'),
        brand: campo('brand'),
        source: campo('source'),
      }
    })
    .filter((m) => m.name)
}

const motos = leerCatalogo()
const sinFoto = motos.filter((m) => !m.image)
const sinPrecio = motos.filter((m) => !m.price)
const sinSpecs = motos.filter((m) => !m.range || !m.speed || !m.power)
const sinDesc = motos.filter((m) => !m.description)

if (process.argv.includes('--sinfoto')) {
  console.log(`${sinFoto.length} modelos sin foto:\n`)
  for (const m of sinFoto) {
    console.log(
      `  ${m.name.padEnd(24)} aut=${String(m.range ?? '-').padStart(3)}  vel=${String(m.speed ?? '-').padStart(3)}  ` +
        `pot=${String(m.power ?? '-').padStart(5)}  ${m.price ? '$' + m.price.toLocaleString('es-CO') : 'sin precio'}`,
    )
  }
} else {
  const pct = (n) => `${Math.round((n / motos.length) * 100)}%`
  console.log(`CATÁLOGO: ${motos.length} modelos\n`)
  console.log(`  con foto ......... ${motos.length - sinFoto.length}  (${pct(motos.length - sinFoto.length)})`)
  console.log(`    · recortada .... ${motos.filter((m) => m.image && !m.photoFit).length}`)
  console.log(`    · de ambiente .. ${motos.filter((m) => m.photoFit === 'cover').length}`)
  console.log(`  con precio ....... ${motos.length - sinPrecio.length}  (${pct(motos.length - sinPrecio.length)})`)
  console.log(`  con descripción .. ${motos.length - sinDesc.length}  (${pct(motos.length - sinDesc.length)})`)
  console.log(`  con ficha completa ${motos.length - sinSpecs.length}  (${pct(motos.length - sinSpecs.length)})`)
  console.log(`\n  sin foto: ${sinFoto.map((m) => m.name).join(', ') || '—'}`)
  console.log(`\n  sin ficha: ${sinSpecs.map((m) => m.name).join(', ') || '—'}`)
}
