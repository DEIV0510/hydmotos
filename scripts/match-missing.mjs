/**
 * Busca candidatos para los modelos del cliente que aún no tienen foto.
 *
 * Cruza sus cifras (autonomía, velocidad, potencia) y su nombre con los 63
 * modelos del Excel. NO decide nada: solo lista los candidatos con su
 * puntuación para revisarlos a ojo, porque poner la foto de otra moto sería
 * peor que dejar el hueco.
 *
 *   node scripts/match-missing.mjs
 */
import { readFileSync } from 'node:fs'
import { leerCatalogo } from './audit.mjs'


const excel = JSON.parse(readFileSync('scripts/data/excel.json', 'utf8'))

const norm = (s) =>
  String(s).toUpperCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Z0-9]/g, '')

const catalogo = leerCatalogo()
const sinFoto = catalogo.filter((m) => !m.image)
const yaUsados = new Set(catalogo.filter((m) => m.image).map((m) => norm(m.name)))

for (const m of sinFoto) {
  const candidatos = excel
    .map((e) => {
      let pts = 0
      const razones = []

      // Nombre: contiene o está contenido
      const a = norm(m.name)
      const b = norm(e.nombre)
      if (a === b) {
        pts += 100
        razones.push('nombre exacto')
      } else if (a.length > 3 && (b.includes(a) || a.includes(b))) {
        pts += 45
        razones.push('nombre parecido')
      }

      // Cifras: cada coincidencia exacta suma
      if (m.range && e.specs.autonomiaKm === m.range) {
        pts += 20
        razones.push(`aut ${m.range}`)
      }
      if (m.speed && e.specs.velocidadKmh === m.speed) {
        pts += 20
        razones.push(`vel ${m.speed}`)
      }
      if (m.power && e.specs.potenciaW === m.power) {
        pts += 20
        razones.push(`pot ${m.power}`)
      }

      return { nombre: e.nombre, pts, razones, ya: yaUsados.has(norm(e.nombre)) }
    })
    .filter((c) => c.pts >= 40)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 3)

  console.log(`\n${m.name}  (aut ${m.range ?? '-'} · vel ${m.speed ?? '-'} · pot ${m.power ?? '-'})`)
  if (!candidatos.length) {
    console.log('   sin candidatos')
    continue
  }
  for (const c of candidatos) {
    console.log(
      `   ${String(c.pts).padStart(3)}  ${c.nombre.padEnd(34)} ${c.razones.join(', ')}${c.ya ? '   [su foto ya la usa otro modelo]' : ''}`,
    )
  }
}
