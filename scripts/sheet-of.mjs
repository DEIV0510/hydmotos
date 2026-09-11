/**
 * Hoja de contacto de un grupo concreto de fotos ya procesadas.
 *
 *   node scripts/sheet-of.mjs <salida.jpg> id1 id2 id3 …
 */
import sharp from 'sharp'
import path from 'node:path'

const [, , out, ...ids] = process.argv
const CELL = 300
const COLS = 5
const PAD = 8
const LABEL = 26

const rows = Math.ceil(ids.length / COLS)
const W = COLS * (CELL + PAD) + PAD
const H = rows * (CELL + PAD + LABEL) + PAD

const layers = []
for (const [i, id] of ids.entries()) {
  const x = PAD + (i % COLS) * (CELL + PAD)
  const y = PAD + Math.floor(i / COLS) * (CELL + PAD + LABEL)

  const foto = await sharp(path.join('public/motos', `${id}@2x.webp`))
    .resize(CELL - 6, CELL - 6, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  const celda = await sharp({ create: { width: CELL, height: CELL, channels: 3, background: '#E4E9F0' } })
    .composite([{ input: foto, gravity: 'center' }])
    .png()
    .toBuffer()
  layers.push({ input: celda, left: x, top: y })

  layers.push({
    input: Buffer.from(
      `<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#101010"/>` +
        `<text x="6" y="18" font-family="monospace" font-size="14" fill="#7DF0FF">${id}</text></svg>`,
    ),
    left: x,
    top: y + CELL,
  })
}

await sharp({ create: { width: W, height: H, channels: 3, background: '#2a2a2a' } })
  .composite(layers)
  .jpeg({ quality: 88 })
  .toFile(out)
console.log(`${ids.length} fotos → ${out}`)
