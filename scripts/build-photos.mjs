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
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
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
  // Catálogo de Biológica: son fotos de calle o parqueadero, no de estudio.
  // Se eligen las de perfil completo y se publican como foto de ambiente.
  'MAK3 - AIMA': '04_mak3_04b.jpg',
  'T3 - AIMA': '03_t3-gris-1.jpg',
  'TROGON - AIMA': '01_IMG_1284a.jpeg',
  'A500 - AIMA': '01_moto-a500-11a.jpg',
  'PORTIVA - MAGMA': '02_Moto-2-01.jpg',
  'VELMPU MILAN 500WATTS 2026': '01_FrontalDiag2-MilanVerde.png',
  'Ciclomotor Electrico Brenson Mobility': '01_MOBILITY_t-red_2.jpg',
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

  // ¿Es fondo de estudio? Se mide cuánto varía el marco de la imagen.
  // Un ciclorama liso apenas varía; una calle o un parqueadero tienen
  // baldosas, coches y vegetación, y la desviación se dispara.
  const marco = []
  const paso = Math.max(1, Math.round(w / 60))
  for (let x = 0; x < w; x += paso) {
    for (const y of [0, 1, h - 2, h - 1]) marco.push((y * w + x) * 4)
  }
  for (let y = 0; y < h; y += paso) {
    for (const x of [0, 1, w - 2, w - 1]) marco.push((y * w + x) * 4)
  }
  const lum = marco.map((i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  const media = lum.reduce((a, b) => a + b, 0) / lum.length
  const desv = Math.sqrt(lum.reduce((a, v) => a + (v - media) ** 2, 0) / lum.length)

  const seen = new Uint8Array(w * h)

  /** Relleno desde los bordes con una tolerancia dada */
  const flood = (t) => {
    const stack = []
    for (let x = 0; x < w; x++) stack.push([x, 0], [x, h - 1])
    for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y])
    while (stack.length) {
      const [x, y] = stack.pop()
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const p = y * w + x
      if (seen[p]) continue
      const i = p * 4
      const cerca =
        Math.abs(data[i] - ref[0]) <= t &&
        Math.abs(data[i + 1] - ref[1]) <= t &&
        Math.abs(data[i + 2] - ref[2]) <= t
      if (!cerca) continue
      seen[p] = 1
      data[i + 3] = 0
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
  }

  // Dos pasadas: la segunda, más tolerante, se lleva los degradados suaves
  // que dejaban una mancha clara pegada al vehículo.
  flood(tol)
  flood(tol + 20)

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

  let recortado = 0
  for (let p = 0; p < w * h; p++) recortado += seen[p]
  const ratio = recortado / (w * h)

  // Solo se recorta cuando el marco es liso (estudio) Y el relleno se llevó
  // una parte razonable. Si falla cualquiera de las dos, la foto se publica
  // como imagen de ambiente, llenando el marco de la tarjeta.
  const esEstudio = desv < 26 && ratio >= 0.25

  const png = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
  return { png, esEstudio, desv: Math.round(desv), ratio: +ratio.toFixed(2) }
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
    const { png, esEstudio, desv, ratio } = await cutout(src)

    if (esEstudio) {
      // Foto de catálogo: el vehículo va recortado y flotando sobre la tarjeta.
      // Cada paso se materializa a PNG porque sharp falla al componer una
      // tubería sin resolver, aunque las medidas encajen.
      const trimmed = await sharp(png).trim({ threshold: 6 }).png().toBuffer()
      const inner = await sharp(trimmed).resize(W - 70, H - 70, { fit: 'inside' }).png().toBuffer()
      const base = await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: inner, gravity: 'center' }])
        .png()
        .toBuffer()

      for (const { w, suf } of SIZES) {
        await sharp(base).resize({ width: w }).webp({ quality: 86, alphaQuality: 90 }).toFile(path.join(OUT, `${id}${suf}.webp`))
      }
    } else {
      // Foto de ambiente (calle, parqueadero): recortarla dejaría un recuadro
      // con trozos de fondo, así que se encuadra y se sirve opaca, llenando
      // el marco de la tarjeta.
      for (const { w, suf } of SIZES) {
        await sharp(src)
          .resize(w, Math.round((w * H) / W), { fit: 'cover', position: 'attention' })
          .webp({ quality: 82 })
          .toFile(path.join(OUT, `${id}${suf}.webp`))
      }
    }

    report.push({ model, id, src: chosen, modo: esEstudio ? 'recorte' : 'ambiente', desv, ratio })
  } catch (e) {
    report.push({ model, id, src: chosen, error: String(e.message).slice(0, 90) })
  }
}

writeFileSync('scripts/photo-modes.json', JSON.stringify(Object.fromEntries(report.filter((r) => !r.error).map((r) => [r.id, r.modo])), null, 1))
console.log(JSON.stringify(report, null, 1))
console.error(`procesadas ${report.filter((r) => !r.error).length} / ${report.length}`)
