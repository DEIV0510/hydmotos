/**
 * Prepara las fotos del catálogo.
 *
 * Las fotos de las tiendas vienen con fondos distintos (blanco puro, gris
 * degradado, gris claro). Si se dejaran tal cual, cada tarjeta mostraría un
 * rectángulo de un tono diferente. Aquí se recorta el fondo por relleno desde
 * los bordes, se ajusta el encuadre al vehículo y se exporta a WebP con
 * transparencia, para que la moto quede apoyada sobre el color de la tarjeta.
 *
 * Las que no se pueden recortar (calle, local) se publican enteras en el marco
 * 4:3 de las tarjetas. Los dos formatos viven en ./encuadre.mjs.
 *
 *   node scripts/build-photos.mjs [--only=Modelo]
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { cutout } from './cutout.mjs'
import { lienzoRecortado, fotoCompleta, LIENZO, MARCO } from './encuadre.mjs'

const [, , ...flags] = process.argv
const picksPath = flags.find((f) => !f.startsWith('--')) ?? 'scripts/data/picks.json'
const only = flags.find((f) => f.startsWith('--only='))?.split('=')[1]
const OUT = 'public/motos'
mkdirSync(OUT, { recursive: true })

/** Overrides: modelos donde la elección automática no acertó */
const MANUAL = {
  Polar: '11_Polar-Negra-1.png',
  Tigre: '01_Tigre_rojo_1.png',
  Tauro: '01_Bicicleta_Tauro_Negro.jpg',
  Tifon: '02_Tifon_roja_con_blanco_1.png',
  'VELMPU MILAN 500WATTS 2026': '01_FrontalDiag2-MilanVerde.png',
  'Ciclomotor Electrico Brenson Mobility': '01_MOBILITY_t-red_2.jpg',
}

/**
 * Modelos cuya foto de tienda NO se publica, por decisión del cliente
 * (2026-09-11): fotos de calle o de parqueadero, varias con la dirección de la
 * tienda impresa encima y una que es un render con plataforma.
 *
 * TROGON y A500 llevan ahora el render oficial de AIMA, que pone
 * build-extra-photos.mjs. T3, MAK3 y PORTIVA siguen sin foto.
 */
const DESCARTADAS = new Set([
  'MAK3 - AIMA',
  'T3 - AIMA',
  'TROGON - AIMA',
  'A500 - AIMA',
  'PORTIVA - MAGMA',
])

/**
 * Carpetas que no se llaman como el modelo.
 * La NIU viene separada por colores ("Azul", "Blanco", "Negro") y son todas
 * el mismo modelo: se publica una y las otras se descartan.
 */
const CARPETA_ES = {
  Azul: 'nqi-sport',
}
const IGNORAR = new Set(['Banners', 'Blanco', 'Negro'])

export function slug(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const picks = JSON.parse(readFileSync(picksPath, 'utf8').replace(/^﻿/, ''))
const report = []

for (const [model, info] of Object.entries(picks)) {
  if (IGNORAR.has(model) || DESCARTADAS.has(model)) continue
  if (only && model !== only) continue
  if (!info.top.length) continue

  const chosen = MANUAL[model] || info.top[0].file
  const src = path.join(info.dir, chosen)
  const id = CARPETA_ES[model] ?? slug(model)

  try {
    const { png, esEstudio, desv, ratio } = await cutout(src)

    if (esEstudio) {
      // Foto de catálogo: el vehículo va recortado y flotando sobre la tarjeta
      const base = await lienzoRecortado(png)
      for (const [w, suf] of [[LIENZO / 2, ''], [LIENZO, '@2x']]) {
        await sharp(base)
          .resize({ width: w })
          .webp({ quality: 86, alphaQuality: 90 })
          .toFile(path.join(OUT, `${id}${suf}.webp`))
      }
    } else {
      // Foto de ambiente (calle, local): recortarla dejaría trozos de fondo,
      // así que se publica entera en el marco 4:3 de la tarjeta
      for (const [escala, suf] of [[0.5, ''], [1, '@2x']]) {
        const buf = await fotoCompleta(src, MARCO.w * escala, MARCO.h * escala, 'difuminar')
        await sharp(buf).webp({ quality: 82 }).toFile(path.join(OUT, `${id}${suf}.webp`))
      }
    }

    report.push({ model, id, src: chosen, modo: esEstudio ? 'recorte' : 'ambiente', desv, ratio })
  } catch (e) {
    report.push({ model, id, src: chosen, error: String(e.message).slice(0, 90) })
  }
}

writeFileSync('scripts/data/photo-modes.json', JSON.stringify(Object.fromEntries(report.filter((r) => !r.error).map((r) => [r.id, r.modo])), null, 1))
console.log(JSON.stringify(report, null, 1))
console.error(`procesadas ${report.filter((r) => !r.error).length} / ${report.length}`)
