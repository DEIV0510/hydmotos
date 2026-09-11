/**
 * Elige, para cada modelo de la carpeta Motors, la mejor foto de producto.
 *
 * Criterio: las fotos útiles para el catálogo son de PERFIL y con el vehículo
 * completo. Se mide el recuadro real del producto (descartando el fondo claro)
 * y se puntúa la proporción y cuánto ocupa del encuadre. Las fichas de PDF,
 * banners, capturas y planos de detalle quedan penalizados.
 *
 *   node scripts/pick-photos.mjs
 */
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = 'C:/Users/Lenovo/Desktop/motors'
const BAD_NAME = /page-0|banner|captura|screenshot|logo|garantia|ficha/i

/** Recuadro del contenido: filas/columnas que no son fondo claro uniforme */
async function contentBox(file) {
  const img = sharp(file).flatten({ background: '#ffffff' })
  const { data, info } = await img
    .resize(180, 180, { fit: 'inside' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: w, height: h } = info
  // Umbral relativo al fondo (esquinas), para tolerar fondos gris claro
  const corners = [data[0], data[w - 1], data[(h - 1) * w], data[h * w - 1]]
  const bg = corners.reduce((a, b) => a + b, 0) / 4
  const T = Math.max(12, bg * 0.12)

  let x0 = w, y0 = h, x1 = -1, y1 = -1, ink = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (Math.abs(data[y * w + x] - bg) > T) {
        ink++
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) return null
  const bw = x1 - x0 + 1
  const bh = y1 - y0 + 1

  // Firma de "vehículo de perfil": en la franja de apoyo hay dos manchas
  // (las ruedas) separadas por un hueco. Un manillar o un tablero en primer
  // plano no la tienen, y así se distinguen de una foto de producto entera.
  const band = Math.max(1, Math.round(bh * 0.16))
  let groups = 0
  let prev = false
  for (let x = x0; x <= x1; x++) {
    let hit = false
    for (let y = y1 - band; y <= y1 && !hit; y++) {
      if (y >= 0 && Math.abs(data[y * w + x] - bg) > T) hit = true
    }
    if (hit && !prev) groups++
    prev = hit
  }

  return { ratio: bw / bh, fill: ink / (w * h), boxFill: (bw * bh) / (w * h), groups }
}

function score(box, name, meta) {
  if (!box) return -1
  let s = 0
  // Perfil: más ancho que alto, sin llegar a panorámico
  if (box.ratio >= 1.15 && box.ratio <= 2.3) s += 45
  else if (box.ratio >= 0.95 && box.ratio < 1.15) s += 18
  else if (box.ratio > 2.3) s -= 25
  else s -= 12 // vertical = foto frontal
  // El vehículo debe llenar el encuadre (descarta planos de detalle sueltos)
  if (box.boxFill > 0.45) s += 25
  else if (box.boxFill > 0.28) s += 12
  else s -= 20
  // Un detalle muy cercano deja muchísima tinta: penaliza el exceso
  if (box.fill > 0.55) s -= 20
  // Ruedas apoyadas: 2-4 manchas en la franja baja. 1 sola suele ser un
  // manillar, un tablero o un plano de detalle.
  if (box.groups >= 2 && box.groups <= 5) s += 35
  else if (box.groups === 1) s -= 45
  else if (box.groups > 8) s -= 15
  if (BAD_NAME.test(name)) s -= 70
  if (meta.width >= 800) s += 8
  if (meta.width < 400) s -= 15
  return s
}

const out = {}
for (const brand of await readdir(ROOT)) {
  const brandDir = path.join(ROOT, brand)
  if (!(await stat(brandDir)).isDirectory()) continue
  for (const sub of await readdir(brandDir)) {
    const subDir = path.join(brandDir, sub)
    if (!(await stat(subDir)).isDirectory()) continue
    for (const model of await readdir(subDir)) {
      const modelDir = path.join(subDir, model)
      const st = await stat(modelDir)
      if (!st.isDirectory()) continue

      const files = (await readdir(modelDir)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
      const ranked = []
      for (const f of files) {
        const full = path.join(modelDir, f)
        try {
          const meta = await sharp(full).metadata()
          const box = await contentBox(full)
          ranked.push({ file: f, score: score(box, f, meta), ratio: box ? +box.ratio.toFixed(2) : 0, w: meta.width, h: meta.height })
        } catch {
          /* imagen ilegible: se ignora */
        }
      }
      ranked.sort((a, b) => b.score - a.score)
      out[model] = { brand, dir: modelDir, total: files.length, top: ranked.slice(0, 4) }
    }
  }
}

mkdirSync('scripts/data', { recursive: true })
writeFileSync('scripts/data/picks.json', JSON.stringify(out, null, 1))
console.log(`${Object.keys(out).length} modelos analizados → scripts/data/picks.json`)
