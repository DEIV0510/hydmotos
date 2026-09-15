import sharp from 'sharp'

/**
 * Quita el fondo por relleno desde los bordes.
 * Solo se propaga por píxeles parecidos al color del borde, así que un blanco
 * interior del vehículo (un guardabarros claro, por ejemplo) se conserva
 * mientras no toque el marco.
 *
 * Vive aparte porque lo usan build-photos.mjs (fotos de las tiendas) y
 * build-extra-photos.mjs (fotos curadas y modelos nuevos). `input` puede ser
 * una ruta o un buffer.
 */
export async function cutout(input, tol = 26) {
  const src = sharp(input).flatten({ background: '#ffffff' })
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
