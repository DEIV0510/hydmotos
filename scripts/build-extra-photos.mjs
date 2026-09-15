/**
 * Fotos que no salen de la elección automática de build-photos.mjs:
 *
 *  1. "Mejores fotos - 17 modelos": renders oficiales y fotos limpias que se
 *     buscaron para los modelos sin foto o con una foto mala. La carpeta trae
 *     "Fuentes de las fotos.xlsx" con el origen de cada una.
 *  2. CLASSIC RUN: la foto que envió el cliente. El nombre va impreso en la
 *     moto («CLASSIC» en el costado y «RUN» en el escudo y el guardabarros).
 *  3. Modelos nuevos de la carpeta Motors (2026-09-15). Solo los que tienen el
 *     nombre escrito en el propio vehículo o en el banner de la marca.
 *
 * Se ejecuta DESPUÉS de build-photos.mjs: sobrescribe algunas de sus fotos y
 * añade sus modos a scripts/data/photo-modes.json.
 *
 *   node scripts/build-extra-photos.mjs
 *
 * Quedan fuera a propósito:
 *  - T3 – AIMA: el render oficial solo enseña la parte trasera, cortada.
 *  - MAK3 – AIMA: la única foto que existe lleva la marca de agua de la tienda.
 *  - FISHER 350: la foto curada es otra del local; no mejora la que ya tiene.
 *  - Motos cuyo modelo no se puede leer con seguridad (la scooter MAGMA de
 *    moto5-13, el triciclo MAGMA de moto28-30 y la scooter negra de 1.png):
 *    no se asocian a ningún producto.
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import { cutout } from './cutout.mjs'
import { lienzoRecortado, fotoCompleta, sinMarcoNegro, LIENZO, MARCO } from './encuadre.mjs'

const MOTORS = 'C:/Users/Lenovo/Desktop/motors'
const MEJORES = path.join(MOTORS, 'Mejores fotos - 17 modelos')
const OUT = 'public/motos'
mkdirSync(OUT, { recursive: true })

/**
 * modo 'recorte' → render de estudio sobre blanco: vehículo recortado.
 * modo 'foto'    → fondo de color, calle o local: foto entera en marco 4:3.
 *                  encaje: ver fotoCompleta en encuadre.mjs ('auto' por omisión).
 */
const FOTOS = [
  // 1. Renders oficiales sobre fondo blanco
  { id: 'zeus', modo: 'recorte', file: [MEJORES, 'ZEUS (Evobike)', '01_MEJOR_Zeus_rojo_evobike-mx.png'] },
  { id: 'family-q', modo: 'recorte', file: [MEJORES, 'FAMILY Q (Evobike)', '01_MEJOR_Family_Q_foto1.png'] },
  {
    id: 'family-plus-5420',
    modo: 'recorte',
    file: [MEJORES, 'FAMILY PLUS 5.420.000 = Family Q Plus (Evobike)', '01_MEJOR_Family_Q_Plus_foto1.jpg'],
  },
  {
    id: 'family-plus-5200',
    modo: 'recorte',
    file: [MEJORES, 'FAMILY PLUS 5.200.000 = Family Plus (Evobike)', '01_MEJOR_Family_Plus_foto1.jpg'],
  },
  { id: 'family', modo: 'recorte', file: [MEJORES, 'FAMILY (Evobike)', '01_MEJOR_Family_foto1.jpg'] },
  { id: 'beetle', modo: 'recorte', file: [MEJORES, 'BEETLE (Evobike)', '01_MEJOR_Beetle_foto1.png'] },
  { id: 'girl-3', modo: 'recorte', file: [MEJORES, 'GIRL 3 (Mobulaa)', '01_MEJOR_Mobulaa_Girl3_foto3.png'] },
  {
    id: 'ciclomotor-electrico-dakota-pro',
    modo: 'recorte',
    file: [MEJORES, 'DAKOTA PRO (Brenson)', '01_MEJOR_Ciclomotor_Electrico_DAKOTA_PRO_foto3.png'],
  },
  {
    id: 'ciclomotor-electrico-verona',
    modo: 'recorte',
    file: [MEJORES, 'VERONA (Brenson)', '01_MEJOR_Ciclomotor_eléctrico_Verona_foto7.png'],
  },
  {
    id: 'ciclomotor-electrico-vera-2026',
    modo: 'recorte',
    file: [MEJORES, 'VERA 2026 (Brenson)', '01_MEJOR_Ciclomotor_electrico_VERA_2026_foto1.png'],
  },
  { id: 'trogon-aima', modo: 'recorte', file: [MEJORES, 'TROGON - AIMA', '01_MEJOR_Aima_Trogon_oficial_aima-uno.png'] },
  { id: 'a500-aima', modo: 'recorte', file: [MEJORES, 'A500 - AIMA', '01_MEJOR_Aima_A500_oficial_aima-uno.jpg'] },

  // Fotos de tienda o de exterior: no existe render de estos modelos
  {
    id: 'magma-neva',
    modo: 'foto',
    file: [MEJORES, 'MAGMA NEVA = NEVA 350 (Biologica)', '01_MEJOR_Neva350_blanca_lateral_biologica.jpg'],
  },
  { id: 'cielo', modo: 'foto', encaje: 'difuminar', file: [MEJORES, 'CIELO (Evobike)', '01_MEJOR_Evobike_Cielo_lateral_emove.png'] },

  // 2. Foto del cliente
  { id: 'classic-run', modo: 'foto', file: [MOTORS, 'moto.png'], marcoNegro: true },

  // 3. Modelos nuevos: nombre leído en el vehículo o en el banner
  { id: 'magma-bubble', modo: 'foto', file: [MOTORS, 'moto15.png'] }, // «Bubble» en banner.png
  { id: 'magma-q2-boxter', modo: 'foto', file: [MOTORS, 'moto21.png'] }, // «Q2 BOXTER» en moto22-23
  { id: 'magma-x1', modo: 'foto', file: [MOTORS, 'moto25.png'] }, // «X1» en el depósito
  { id: 'magma-one', modo: 'foto', encaje: 'difuminar', file: [MOTORS, 'moto31.png'] }, // «ONE» en el frontal y el costado
  { id: 'x-baw', modo: 'foto', file: [MOTORS, '8.png'] }, // «SUPER BIKE X.BAW» en el frontal
]

const modosPath = 'scripts/data/photo-modes.json'
const modos = existsSync(modosPath) ? JSON.parse(readFileSync(modosPath, 'utf8')) : {}
const report = []

for (const f of FOTOS) {
  const file = path.join(...f.file)
  try {
    if (!existsSync(file)) throw new Error('no existe el archivo')
    const input = f.marcoNegro ? await sinMarcoNegro(file) : file

    if (f.modo === 'recorte') {
      const { png, esEstudio, desv, ratio } = await cutout(input)
      // Si el fondo no resultó liso, un recorte dejaría restos: se para aquí
      // en vez de publicar una foto sucia.
      if (!esEstudio) throw new Error(`fondo no liso (desv=${desv}, recortado=${ratio})`)
      const base = await lienzoRecortado(png)
      for (const [w, suf] of [[LIENZO / 2, ''], [LIENZO, '@2x']]) {
        await sharp(base)
          .resize({ width: w })
          .webp({ quality: 86, alphaQuality: 90 })
          .toFile(path.join(OUT, `${f.id}${suf}.webp`))
      }
      modos[f.id] = 'recorte'
    } else {
      for (const [escala, suf] of [[0.5, ''], [1, '@2x']]) {
        const w = MARCO.w * escala
        const h = MARCO.h * escala
        const buf = await fotoCompleta(input, w, h, f.encaje ?? 'auto')
        await sharp(buf).webp({ quality: 82 }).toFile(path.join(OUT, `${f.id}${suf}.webp`))
      }
      modos[f.id] = 'ambiente'
    }
    report.push({ id: f.id, modo: f.modo, ok: true })
  } catch (e) {
    report.push({ id: f.id, modo: f.modo, error: String(e.message).slice(0, 90) })
  }
}

writeFileSync(modosPath, JSON.stringify(modos, null, 1))
for (const r of report) console.log(r.ok ? '  ✓' : '  ✗', r.id.padEnd(34), r.modo, r.error ?? '')
console.error(`extra: ${report.filter((r) => r.ok).length} / ${report.length}`)
if (report.some((r) => !r.ok)) process.exitCode = 1
