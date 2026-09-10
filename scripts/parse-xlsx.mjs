/**
 * Lee el Excel de descripciones que entregó el cliente y lo vuelca a JSON
 * normalizado, con las specs de la ficha técnica ya interpretadas.
 *
 *   node scripts/parse-xlsx.mjs > catalogo-crudo.json
 */
import XLSX from 'xlsx'

const FILE = 'C:/Users/Lenovo/Desktop/motors/Descripciones_motos_y_bicicletas_electricas.xlsx'
const wb = XLSX.readFile(FILE)

/** Primer número de un texto, tolerando "60 V", "1.500 W", "45-55 km" */
const num = (s) => {
  const m = String(s).replace(/\./g, '').match(/(\d+(?:,\d+)?)/)
  return m ? Number(m[1].replace(',', '.')) : null
}

/** Km de autonomía: evita confundirlos con el voltaje ("60V: 55 km") */
const kmOf = (s) => {
  const all = [...String(s).matchAll(/(\d+(?:[.,]\d+)?)\s*km(?!\s*\/\s*h)/gi)].map((m) =>
    Number(m[1].replace(',', '.')),
  )
  return all.length ? Math.max(...all) : null
}

/** Velocidad: solo números seguidos de km/h */
const kmhOf = (s) => {
  const all = [...String(s).matchAll(/(\d+(?:[.,]\d+)?)\s*km\s*\/\s*h/gi)].map((m) =>
    Number(m[1].replace(',', '.')),
  )
  return all.length ? Math.max(...all) : null
}

/** Busca una línea de la ficha técnica por etiqueta */
function spec(ficha, ...labels) {
  const lines = String(ficha).split('\n')
  for (const label of labels) {
    const re = new RegExp(`^[•\\-\\s]*${label}\\s*:?\\s*(.+)$`, 'i')
    for (const l of lines) {
      const m = l.trim().match(re)
      if (m) return m[1].trim().replace(/\.$/, '')
    }
  }
  return ''
}

const out = []
for (const sheet of wb.SheetNames) {
  if (sheet === 'Resumen') continue
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, defval: '' })
  const head = rows.findIndex((r) => String(r[0]).trim() === '#')
  if (head < 0) continue

  for (const r of rows.slice(head + 1)) {
    const name = String(r[1] || '').trim()
    if (!name) continue

    const ficha = String(r[8] || '')
    const potencia = spec(ficha, 'Potencia', 'Motor')
    const bateria = spec(ficha, 'Batería', 'Bateria')
    const autonomia = spec(ficha, 'Autonomía', 'Autonomia', 'Recorrido')
    const velocidad = spec(ficha, 'Velocidad máxima', 'Velocidad')
    const capacidad = spec(ficha, 'Capacidad')
    const frenos = spec(ficha, 'Frenos', 'Freno')
    const llantas = spec(ficha, 'Llantas', 'Llanta', 'Rin')
    const carga = spec(ficha, 'Tiempo de carga', 'Carga')
    const peso = spec(ficha, 'Peso máximo soportado', 'Peso soportado', 'Peso')

    out.push({
      proveedor: sheet,
      nombre: name,
      precio: num(r[2]),
      precioHasta: num(r[3]),
      precioAnterior: num(r[4]),
      opciones: String(r[5] || '').trim(),
      variantes: String(r[6] || '').trim(),
      descripcion: String(r[7] || '').trim(),
      ficha,
      fotos: num(r[9]) || 0,
      carpeta: String(r[10] || '').split('→').pop()?.trim() || '',
      url: String(r[11] || '').trim(),
      specs: {
        potenciaW: num(potencia),
        potenciaTxt: potencia,
        bateriaTxt: bateria,
        autonomiaKm: kmOf(autonomia),
        autonomiaTxt: autonomia,
        velocidadKmh: kmhOf(velocidad),
        velocidadTxt: velocidad,
        capacidad,
        frenos,
        llantas,
        carga,
        peso,
      },
    })
  }
}

console.log(JSON.stringify(out, null, 1))
