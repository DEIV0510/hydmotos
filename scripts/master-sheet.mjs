/**
 * Hoja maestra: la mejor foto de cada modelo, con su nombre, para revisar
 * de un vistazo qué hay en la carpeta Motors y confirmar los emparejamientos.
 *
 *   node scripts/master-sheet.mjs <picks.json> <salida-base> [porHoja]
 */
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const [, , picksPath, outBase, perSheetRaw] = process.argv
const PER = Number(perSheetRaw) || 24
const CELL = 260
const COLS = 6
const PAD = 8
const LABEL = 26

const picks = JSON.parse(readFileSync(picksPath, 'utf8').replace(/^﻿/, ''))
const models = Object.entries(picks).filter(([, v]) => v.top.length)

for (let s = 0; s * PER < models.length; s++) {
  const chunk = models.slice(s * PER, (s + 1) * PER)
  const rows = Math.ceil(chunk.length / COLS)
  const W = COLS * (CELL + PAD) + PAD
  const H = rows * (CELL + PAD + LABEL) + PAD

  const layers = []
  for (const [i, [model, info]] of chunk.entries()) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PAD + col * (CELL + PAD)
    const y = PAD + row * (CELL + PAD + LABEL)

    const file = path.join(info.dir, info.top[0].file)
    const buf = await sharp(file)
      .resize(CELL, CELL, { fit: 'contain', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .toBuffer()
    layers.push({ input: buf, left: x, top: y })

    const safe = model.replace(/[<&>]/g, '').slice(0, 30)
    const label = Buffer.from(
      `<svg width="${CELL}" height="${LABEL}"><rect width="${CELL}" height="${LABEL}" fill="#101010"/>` +
        `<text x="6" y="18" font-family="monospace" font-size="14" fill="#7DF0FF">${safe}</text></svg>`,
    )
    layers.push({ input: label, left: x, top: y + CELL })
  }

  const out = `${outBase}-${s + 1}.jpg`
  await sharp({ create: { width: W, height: H, channels: 3, background: '#1a1a1a' } })
    .composite(layers)
    .jpeg({ quality: 84 })
    .toFile(out)
  console.log(`hoja ${s + 1}: ${chunk.length} modelos → ${out}`)
}
