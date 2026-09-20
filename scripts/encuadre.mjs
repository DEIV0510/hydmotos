import sharp from 'sharp'

/**
 * Formatos de salida de las fotos del catálogo. Lo comparten build-photos.mjs
 * (fotos elegidas de las tiendas) y build-extra-photos.mjs (fotos curadas y
 * modelos nuevos), para que todas salgan con el mismo encuadre.
 */

/** Lienzo de las fotos recortadas: cuadrado, con el vehículo centrado */
export const LIENZO = 900

/** Marco de las fotos enteras: el mismo 4:3 de las tarjetas */
export const MARCO = { w: 1000, h: 750 }

/**
 * Vehículo ya recortado (PNG con alfa) centrado en el lienzo cuadrado.
 * Cada paso se materializa a PNG porque sharp falla al componer una tubería
 * sin resolver, aunque las medidas encajen.
 */
export async function lienzoRecortado(png) {
  const trimmed = await sharp(png).trim({ threshold: 6 }).png().toBuffer()
  const inner = await sharp(trimmed)
    .resize(LIENZO - 70, LIENZO - 70, { fit: 'inside' })
    .png()
    .toBuffer()
  return sharp({
    create: { width: LIENZO, height: LIENZO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toBuffer()
}

/**
 * Foto entera dentro de un marco fijo, sin recortar el vehículo.
 *
 * Las fotos que no se pueden recortar (fondos de color de estudio, calle, el
 * local) se publican completas en el marco 4:3 de las tarjetas. Hay tres
 * formas de encajarlas, según la foto:
 *
 *  - 'recortar'  → más ancha que el marco (16:9) y con el vehículo centrado:
 *                  se quita un poco de fondo por los lados.
 *  - 'extender'  → cuadrada o vertical sobre un fondo de estudio liso: el fondo
 *                  se prolonga copiando los píxeles del borde, sin costura.
 *  - 'difuminar' → escena real (calle, local, fondo con textura): el hueco se
 *                  rellena con la misma foto muy desenfocada. Copiar el borde
 *                  aquí dejaría rayas.
 *
 * 'auto' elige entre las dos primeras por la proporción. Nunca amplía la foto.
 */
export async function fotoCompleta(input, W, H, encaje = 'auto') {
  const opts = { limitInputPixels: false }
  const meta = await sharp(input, opts).metadata()
  const modo = encaje === 'auto' ? (meta.width / meta.height > W / H + 0.02 ? 'recortar' : 'extender') : encaje

  if (modo === 'recortar') {
    // Se recorta el original SIN destarar antes: 'cover' ya necesita ese
    // margen de sobra para poder quitar algo de fondo por los lados sin
    // tocar el vehículo. Destararlo primero (como se probó) deja muy poco
    // margen y el recorte central puede quedar descuadrado si la foto no
    // tenía al vehículo perfectamente centrado (pasaba con CLASSIC RUN).
    return sharp(input, opts).removeAlpha().resize(W, H, { fit: 'cover', position: 'centre' }).png().toBuffer()
  }

  // Recorta el margen sobrante de fondo antes de encajar: si no, una foto de
  // estudio con mucho aire alrededor deja el vehículo pequeño y descuadrado
  // frente a las tarjetas en modo 'recorte' (que sí llenan el lienzo). Seguro
  // aquí porque solo se va a rellenar (nunca a recortar) lo que sobre.
  let base = input
  if (encaje !== 'difuminar') {
    const recortado = await sharp(input, opts).trim({ threshold: 24 }).png().toBuffer()
    const tmeta = await sharp(recortado, opts).metadata()
    // 2px hacia adentro: el borde del recorte puede quedar justo en un pixel
    // de sombra o de un detalle oscuro del vehículo, que al reescalar se ve
    // como una raya fina junto al blanco (pasaba en TRICIMOTOR).
    const inset = 2
    base = await sharp(recortado, opts)
      .extract({
        left: inset,
        top: inset,
        width: Math.max(1, tmeta.width - inset * 2),
        height: Math.max(1, tmeta.height - inset * 2),
      })
      .png()
      .toBuffer()
  }
  const metaBase = encaje === 'difuminar' ? meta : await sharp(base, opts).metadata()

  const escala = Math.min(1, W / metaBase.width, H / metaBase.height)
  const w = Math.round(metaBase.width * escala)
  const h = Math.round(metaBase.height * escala)
  const frente = await sharp(base, opts).removeAlpha().resize(w, h).png().toBuffer()

  if (modo === 'extender') {
    const izq = Math.floor((W - w) / 2)
    const arriba = Math.floor((H - h) / 2)
    // Blanco liso, no 'copy': copiar el píxel del borde se ve bien si ese
    // borde es blanco, pero si toca una sombra o un detalle oscuro del
    // vehículo, esa franja entera sale negra (pasaba en BIWI y TRICIMOTOR).
    return sharp(frente)
      .extend({
        left: izq,
        right: W - w - izq,
        top: arriba,
        bottom: H - h - arriba,
        extendWith: 'background',
        background: '#ffffff',
      })
      .png()
      .toBuffer()
  }

  const fondo = await sharp(base, opts)
    .removeAlpha()
    .resize(W, H, { fit: 'cover' })
    .blur(28)
    .png()
    .toBuffer()
  return sharp(fondo).composite([{ input: frente, gravity: 'center' }]).png().toBuffer()
}

/**
 * Quita el marco negro de unos píxeles que traen algunas capturas de vídeo
 * (las de CLASSIC RUN tienen 3-4 filas negras arriba y una columna a un lado).
 * Sin esto el marco se cuela en el encuadre como una raya oscura.
 */
export async function sinMarcoNegro(input, umbral = 60) {
  const opts = { limitInputPixels: false }
  const { data, info } = await sharp(input, opts).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H, channels: C } = info
  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  const fila = (y) => {
    let s = 0
    for (let x = 0; x < W; x++) s += lum((y * W + x) * C)
    return s / W
  }
  const col = (x) => {
    let s = 0
    for (let y = 0; y < H; y++) s += lum((y * W + x) * C)
    return s / H
  }
  let top = 0
  while (top < H / 10 && fila(top) < umbral) top++
  let bottom = H - 1
  while (bottom > H - H / 10 && fila(bottom) < umbral) bottom--
  let left = 0
  while (left < W / 10 && col(left) < umbral) left++
  let right = W - 1
  while (right > W - W / 10 && col(right) < umbral) right--

  return sharp(input, opts)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .png()
    .toBuffer()
}
