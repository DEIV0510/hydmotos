/**
 * Hoja de contacto para curar las fotos de la carpeta Motors.
 * Genera una rejilla numerada por modelo para elegir a ojo cuál sirve
 * como foto principal del catálogo.
 *
 *   node scripts/contact-sheet.mjs "<ruta del modelo>" <salida.jpg> [maxItems]
 */
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const [, , dir, out, maxRaw] = process.argv
const MAX = Number(maxRaw) || 24
const CELL = 220
const COLS = 6
const PAD = 6

const files = (await readdir(dir))
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort()
  .slice(0, MAX)

const rows = Math.ceil(files.length / COLS)
const W = COLS * (CELL + PAD) + PAD
const H = rows * (CELL + PAD + 18) + PAD

const layers = []
for (const [i, f] of files.entries()) {
  const col = i % COLS
  const row = Math.floor(i / COLS)
  const x = PAD + col * (CELL + PAD)
  const y = PAD + row * (CELL + PAD + 18)

  const buf = await sharp(path.join(dir, f))
    .resize(CELL, CELL, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
    .flatten({ background: '#ffffff' })
    .toBuffer()
  layers.push({ input: buf, left: x, top: y })

  // Número de la miniatura, para poder nombrarla al elegir
  const label = Buffer.from(
    `<svg width="${CELL}" height="18"><rect width="${CELL}" height="18" fill="#111"/>` +
      `<text x="4" y="13" font-family="monospace" font-size="12" fill="#0f0">${String(i + 1).padStart(2, '0')}</text>` +
      `<text x="26" y="13" font-family="monospace" font-size="10" fill="#ccc">${f.slice(0, 30).replace(/[<&>]/g, '')}</text></svg>`,
  )
  layers.push({ input: label, left: x, top: y + CELL })
}

await sharp({ create: { width: W, height: H, channels: 3, background: '#222' } })
  .composite(layers)
  .jpeg({ quality: 82 })
  .toFile(out)

console.log(`${path.basename(dir)}: ${files.length} imágenes → ${out}`)
