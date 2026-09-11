/**
 * Auditoría del catálogo de repuestos: qué está completo y qué falta.
 * Lee el repuestos.ts generado sin compilar TypeScript, igual que audit.mjs.
 *
 *   node scripts/audit-parts.mjs           → resumen
 *   node scripts/audit-parts.mjs --sinfoto → solo los que no tienen foto
 */
import { readFileSync, existsSync } from 'node:fs'

const src = readFileSync('src/data/repuestos.ts', 'utf8')
const cuerpo = src.slice(src.indexOf('export const REPUESTOS'))

const bloques = cuerpo.split(/\n {2}\{\n/).slice(1)
const repuestos = bloques
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
      name: campo('name'),
      category: campo('category'),
      sku: campo('sku'),
      price: campo('price'),
      oldPrice: campo('oldPrice'),
      image: campo('image'),
      description: campo('description'),
    }
  })
  .filter((r) => r.name)

const sinFoto = repuestos.filter((r) => !r.image)
const sinPrecio = repuestos.filter((r) => !r.price)
const sinSku = repuestos.filter((r) => !r.sku)
const sinDesc = repuestos.filter((r) => !r.description)
// Una ruta rota en la web no se ve hasta que alguien abre la sección
const fotosAusentes = repuestos.filter(
  (r) => r.image && !existsSync(`public/repuestos/${r.image}.webp`),
)

if (process.argv.includes('--sinfoto')) {
  console.log(`${sinFoto.length} repuestos sin foto:\n`)
  for (const r of sinFoto) {
    console.log(`  ${(r.sku ?? '(sin ref)').padEnd(11)} ${r.category.padEnd(30)} ${r.name}`)
  }
} else {
  const pct = (n) => `${Math.round((n / repuestos.length) * 100)}%`
  const cat = new Map()
  for (const r of repuestos) cat.set(r.category, (cat.get(r.category) ?? 0) + 1)
  const precios = repuestos.filter((r) => r.price).map((r) => r.price)

  console.log(`REPUESTOS: ${repuestos.length} referencias\n`)
  console.log(`  con foto ......... ${repuestos.length - sinFoto.length}  (${pct(repuestos.length - sinFoto.length)})`)
  console.log(`  con precio ....... ${repuestos.length - sinPrecio.length}  (${pct(repuestos.length - sinPrecio.length)})`)
  console.log(`  con referencia ... ${repuestos.length - sinSku.length}  (${pct(repuestos.length - sinSku.length)})`)
  console.log(`  con descripción .. ${repuestos.length - sinDesc.length}  (${pct(repuestos.length - sinDesc.length)})`)
  console.log(`  en oferta ........ ${repuestos.filter((r) => r.oldPrice).length}`)
  console.log(
    `  precios .......... $${Math.min(...precios).toLocaleString('es-CO')} – $${Math.max(...precios).toLocaleString('es-CO')}`,
  )
  console.log(`\n  categorías (${cat.size}):`)
  for (const [c, n] of [...cat].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(3)}  ${c}`)
  }
  console.log(`\n  sin foto: ${sinFoto.map((r) => r.name).join(', ') || '—'}`)
  if (fotosAusentes.length) {
    console.log(`\n  ⚠️ fotos que faltan en disco: ${fotosAusentes.map((r) => r.image).join(', ')}`)
  }
}
