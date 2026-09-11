/**
 * Saca del catálogo qué componentes reales se manejan, para que la sección
 * de repuestos hable de lo que de verdad montan estas motos y no de una
 * lista genérica inventada.
 *
 *   node scripts/parts-from-catalog.mjs
 */
import { readFileSync } from 'node:fs'

const excel = JSON.parse(readFileSync('scripts/data/excel.json', 'utf8'))

/** Valores distintos que aparecen en una etiqueta de la ficha */
function valoresDe(...etiquetas) {
  const vistos = new Map()
  for (const m of excel) {
    for (const d of m.detalle ?? []) {
      if (!etiquetas.some((e) => d.label.toLowerCase().includes(e))) continue
      // Se normaliza para agrupar, pero se guarda el texto tal cual
      const clave = d.value.toLowerCase().replace(/\s+/g, ' ').slice(0, 40)
      if (!vistos.has(clave)) vistos.set(clave, d.value)
    }
  }
  return [...vistos.values()]
}

const grupos = {
  'Baterías': valoresDe('batería', 'bateria'),
  'Cargadores': valoresDe('cargador'),
  'Llantas y rines': valoresDe('llanta', 'rin'),
  'Frenos': valoresDe('freno'),
  'Suspensión': valoresDe('suspensión'),
  'Luces': valoresDe('luces', 'luz', 'farola'),
  'Tablero': valoresDe('tablero'),
  'Espejos': valoresDe('espejo'),
  'Alarma y bloqueo': valoresDe('alarma', 'bloqueo'),
  'Baúl y parrilla': valoresDe('baúl', 'baul', 'parrilla'),
}

for (const [nombre, valores] of Object.entries(grupos)) {
  console.log(`\n${nombre}  (${valores.length} variantes)`)
  valores.slice(0, 8).forEach((v) => console.log(`   · ${v.slice(0, 70)}`))
}
