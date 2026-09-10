/**
 * Hoja de revisión de las fotos YA procesadas en public/motos.
 * Las compone sobre el gris de la tarjeta para ver el resultado final:
 * recortes fallidos, fotos de ambiente y planos de detalle saltan a la vista.
 *
 *   node scripts/review-photos.mjs <salida-base> [porHoja]
 */
import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

const [, , outBase, perRaw] = process.argv
const PER = Number(perRaw) || 24
const CELL = 230
const COLS = 6
const PAD = 8
const LABEL = 24

const dir = 'public/motos'
const files = (await readdir(dir)).filter((f) => f.endsWith('.webp') && !f.includes('@2x')).sort()

for (let s = 0; s * PER < files.length; s++) {
  const chunk = files.slice(s * PER, (s + 1) * PER)
  const rows = Math.ceil(chunk.length / COLS)
  const W = COLS * (CELL + PAD) + PAD
  const H = rows * (CELL + PAD + LABEL) + PAD

  const layers = []
  for (const [i, f] of chunk.entries()) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PAD + col * (CELL + PAD)
    const y = PAD + row * (CELL + PAD + LABEL)

    // Fondo gris de la tarjeta: revela si el recorte dejó un rectángulo
    const cell = await sharp({
      create: { width: CELL, height: CELL, channels: 3, background: '#E4E9F0' },
    })
      .composite([
        { input: await sharp(path.join(dir, f)).resize(CELL - 8, CELL - 8, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), gravity: 'center' },
      ])
      .png()
      .toBuffer()
    layers.push({ input: cell, left: x, top: y })

    const name = f.replace('.webp', '').slice(0, 28)
    layers.push({
      input: Buffer.from(
        `<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#101010"/>` +
          `<text x="5" y="17" font-family="monospace" font-size="13" fill="#7DF0FF">${name}</text></svg>`,
      ),
      left: x,
      top: y + CELL,
    })
  }

  const out = `${outBase}-${s + 1}.jpg`
  await sharp({ create: { width: W, height: H, channels: 3, background: '#2a2a2a' } })
    .composite(layers)
    .jpeg({ quality: 84 })
    .toFile(out)
  console.log(`hoja ${s + 1}: ${chunk.length} → ${out}`)
}
