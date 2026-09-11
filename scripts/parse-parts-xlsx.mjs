/**
 * Lee el Excel de repuestos (Bicyrekkord) y lo vuelca a JSON normalizado.
 *
 *   node scripts/parse-parts-xlsx.mjs
 */
import XLSX from 'xlsx'
import { writeFileSync, mkdirSync } from 'node:fs'

const FILE = 'C:/Users/Lenovo/Desktop/motors/Repuestos_Bicyrekkord.xlsx'
const wb = XLSX.readFile(FILE)

const num = (s) => {
  const m = String(s).replace(/\./g, '').match(/(\d+)/)
  return m ? Number(m[1]) : null
}

const rows = XLSX.utils.sheet_to_json(wb.Sheets['Repuestos'], { header: 1, defval: '' })
const head = rows.findIndex((r) => String(r[0]).trim() === '#')

const out = []
for (const r of rows.slice(head + 1)) {
  const nombre = String(r[3] || '').trim()
  if (!nombre) continue

  const ficha = String(r[11] || '')
  // La ficha viene como "Atributo: valor" separados por saltos o barras
  const atributos = []
  for (const linea of ficha.split(/\n|(?<=\S) \| (?=\S)/)) {
    const m = linea.trim().match(/^[•\-\s]*([^:]{2,40}?)\s*:\s*(.+)$/)
    if (!m) continue
    const value = m[2].trim().replace(/\.$/, '')
    if (value.length > 90) continue
    atributos.push({ label: m[1].trim(), value })
  }

  out.push({
    categoria: String(r[1] || '').trim(),
    subcategoria: String(r[2] || '').replace('(sin subcategoría)', '').trim(),
    nombre,
    precio: num(r[4]),
    precioHasta: num(r[5]),
    precioRegular: num(r[6]),
    enOferta: /^s[ií]/i.test(String(r[7])),
    disponible: !/^no/i.test(String(r[8])),
    sku: String(r[9] || '').trim(),
    descripcion: String(r[10] || '').trim(),
    atributos,
    variantes: String(r[12] || '').trim(),
    fotos: num(r[13]) || 0,
    carpeta: String(r[14] || '').trim(),
    url: String(r[15] || '').trim(),
  })
}

mkdirSync('scripts/data', { recursive: true })
writeFileSync('scripts/data/repuestos-excel.json', JSON.stringify(out, null, 1))

const cats = {}
for (const p of out) cats[p.categoria] = (cats[p.categoria] ?? 0) + 1
console.log(`${out.length} repuestos → scripts/data/repuestos-excel.json`)
console.log(`\nPor categoría:`)
for (const [c, n] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${c}`)
}
console.log(
  `\nCon precio: ${out.filter((p) => p.precio).length} · en oferta: ${out.filter((p) => p.enOferta).length} · con SKU: ${out.filter((p) => p.sku).length} · con foto declarada: ${out.filter((p) => p.fotos).length}`,
)
