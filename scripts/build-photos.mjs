/**
 * Prepara las fotos del catálogo.
 *
 * Las fotos de las tiendas vienen con fondos distintos (blanco puro, gris
 * degradado, gris claro). Si se dejaran tal cual, cada tarjeta mostraría un
 * rectángulo de un tono diferente. Aquí se recorta el fondo por relleno desde
 * los bordes, se ajusta el encuadre al vehículo y se exporta a WebP con
 * transparencia, para que la moto quede apoyada sobre el color de la tarjeta.
 *
 *   node scripts/build-photos.mjs <picks.json> [--only=Modelo]
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const [, , picksPath, ...flags] = process.argv
const only = flags.find((f) => f.startsWith('--only='))?.split('=')[1]
const OUT = 'public/motos'
mkdirSync(OUT, { recursive: true })

// Encuadre cuadrado: las fotos de las tiendas son verticales (1080x1434) o
// cuadradas, así que un lienzo 1:1 aprovecha mucho mejor el vehículo que el
// formato apaisado que usan las siluetas vectoriales.
const W = 900
const H = 900
const SIZES = [{ w: 450, suf: '' }, { w: 900, suf: '@2x' }]

/** Overrides: modelos donde la elección automática no acertó */
const MANUAL = {
  Polar: '11_Polar-Negra-1.png',
  Tigre: '01_Tigre_rojo_1.png',
  Tauro: '01_Bicicleta_Tauro_Negro.jpg',
  Tifon: '02_Tifon_roja_con_blanco_1.png',
}

export function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Quita el fondo por relleno desde los bordes.
 * Solo se propaga por píxeles parecidos al color del borde, así que un blanco
 * interior del vehículo (un guardabarros claro, por ejemplo) se conserva
 * mientras no toque el marco.
 */
async function cutout(file, tol = 26) {
  const src = sharp(file).flatten({ background: '#ffffff' })
  const { data, info } = await src.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const at = (x, y) => (y * w + x) * 4

  // Color de referencia: mediana de las cuatro esquinas
  const corner = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)].map((i) => [
    data[i], data[i + 1], data[i + 2],
  ])
  const ref = [0, 1, 2].map((c) => corner.reduce((a, p) => a + p[c], 0) / 4)
  const near = (i) =>
    Math.abs(data[i] - ref[0]) <= tol &&
    Math.abs(data[i + 1] - ref[1]) <= tol &&
    Math.abs(data[i + 2] - ref[2]) <= tol

  const seen = new Uint8Array(w * h)
  const stack = []
  for (let x = 0; x < w; x++) {
    stack.push([x, 0], [x, h - 1])
  }
  for (let y = 0; y < h; y++) {
    stack.push([0, y], [w - 1, y])
  }

  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || y < 0 || x >= w || y >= h) continue
    const p = y * w + x
    if (seen[p]) continue
    const i = p * 4
    if (!near(i)) continue
    seen[p] = 1
    data[i + 3] = 0
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  // Suaviza el borde: los píxeles opacos junto a uno recortado se atenúan
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x
      if (seen[p]) continue
      const i = p * 4
      if (!near(i)) continue
      const vecinos = seen[p - 1] + seen[p + 1] + seen[p - w] + seen[p + w]
      if (vecinos) data[i + 3] = 90
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
}

const picks = JSON.parse(readFileSync(picksPath, 'utf8').replace(/^﻿/, ''))
const report = []

for (const [model, info] of Object.entries(picks)) {
  if (model === 'Banners') continue
  if (only && model !== only) continue
  if (!info.top.length) continue

  const chosen = MANUAL[model] || info.top[0].file
  const src = path.join(info.dir, chosen)
  const id = slug(model)

  try {
    const cut = await cutout(src)
    // Cada paso se materializa a PNG: sharp falla al componer si la entrada
    // llega como una tubería sin resolver, aunque las medidas encajen.
    const trimmed = await sharp(cut).trim({ threshold: 6 }).png().toBuffer()
    const before = await sharp(trimmed).metadata()

    const inner = await sharp(trimmed)
      .resize(W - 70, H - 70, { fit: 'inside' })
      .png()
      .toBuffer()
    const after = await sharp(inner).metadata()

    const base = await sharp({
      create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: inner, gravity: 'center' }])
      .png()
      .toBuffer()

    for (const { w, suf } of SIZES) {
      await sharp(base)
        .resize({ width: w })
        .webp({ quality: 86, alphaQuality: 90 })
        .toFile(path.join(OUT, `${id}${suf}.webp`))
    }

    report.push({ model, id, src: chosen, recorte: `${before.width}x${before.height}`, encaje: `${after.width}x${after.height}` })
  } catch (e) {
    report.push({ model, id, src: chosen, error: String(e.message).slice(0, 90) })
  }
}

console.log(JSON.stringify(report, null, 1))
console.error(`procesadas ${report.filter((r) => !r.error).length} / ${report.length}`)
