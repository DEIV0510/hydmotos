/**
 * Prepara el logo oficial para la web.
 * El PNG original viene en un lienzo cuadrado con mucho aire alrededor,
 * así que se recorta por el canal alfa (no por color: el logo tiene negros
 * y sombras que un trim por color se comería) y se exporta en los tamaños
 * que usa la página.
 *
 *   node scripts/build-logo.mjs
 */
import sharp from 'sharp'
import path from 'node:path'
import { mkdir } from 'node:fs/promises'

const SRC = 'C:/Users/Lenovo/Desktop/motors/logo.png'
const OUT = 'public/marca'
await mkdir(OUT, { recursive: true })

/** Recuadro de los píxeles con alfa por encima del umbral */
async function alphaBox(file, threshold = 12) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > threshold) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) throw new Error('logo sin píxeles opacos')
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 }
}

const box = await alphaBox(SRC)
const meta = await sharp(SRC).metadata()
console.log(`original ${meta.width}x${meta.height} → contenido ${box.width}x${box.height}`)

const base = sharp(SRC).extract(box)
const baseBuf = await base.png().toBuffer()

// Ancho completo del wordmark, para el pie y la pantalla de carga
for (const w of [280, 560]) {
  await sharp(baseBuf).resize({ width: w }).webp({ quality: 92 }).toFile(path.join(OUT, `logo-${w}.webp`))
  await sharp(baseBuf).resize({ width: w }).png({ compressionLevel: 9 }).toFile(path.join(OUT, `logo-${w}.png`))
}

// Solo el monograma H&D (la fila superior de bloques) para el favicon
const markH = Math.round(box.height * 0.52)
const markBuf = await sharp(baseBuf)
  .extract({ left: 0, top: 0, width: box.width, height: markH })
  .toBuffer()
await sharp(markBuf).resize({ width: 512 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'monograma.png'))

const out = await sharp(path.join(OUT, 'logo-560.webp')).metadata()
console.log(`logo-560.webp → ${out.width}x${out.height}`)
console.log('listo:', OUT)
