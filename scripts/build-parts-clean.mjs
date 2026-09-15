/**
 * Sustituye las fotos de repuestos sacadas del PDF de Bicyrekkord (llevan su
 * marca de agua) por las de la carpeta «Repuestos sin marca de agua».
 *
 * Esa carpeta se armó con búsqueda inversa por imagen: son fotos de otros
 * vendedores o del fabricante del mismo repuesto. Su Excel marca 9 exactas,
 * 105 equivalentes y 20 «para revisar». Se revisaron todas a ojo contra la
 * foto original, lado a lado (2026-09-15), y NO se usan las que enseñan otra
 * pieza, otro conector, otra marca en la etiqueta o la marca de agua de otra
 * tienda. Esas se quedan SIN foto (la tarjeta muestra el icono de su
 * categoría): el cliente no quiere ninguna con marca de agua (15/09) y tampoco
 * sirve la foto de un repuesto que no es.
 *
 * Se ejecuta DESPUÉS de parts:photos (que vuelve a sacar todas del PDF):
 *
 *   node scripts/build-parts-clean.mjs
 */
import sharp from 'sharp'
import { createRequire } from 'node:module'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { archivoDeSku, slugNombre } from './sku.mjs'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

const CARPETA = 'C:/Users/Lenovo/Desktop/motors/Repuestos sin marca de agua'
const OUT = 'public/repuestos'
const SIZES = [{ w: 360, suf: '' }, { w: 720, suf: '@2x' }]

/** Revisadas a ojo: la foto «equivalente» no enseña el mismo repuesto */
const NO_USAR = {
  RKAC019: 'otro acelerador, con otra botonera',
  RKAB001: 'es una farola, no un altavoz',
  RKCM015: 'otro conector (tipo encendedor)',
  RKCM016: 'otro conector',
  RKCM017: 'otro conector (en ocho)',
  RKCM008: 'otro arnés',
  RKCG010: 'otro cargador',
  RKCG001: 'otro cargador',
  RKCM006: 'otros terminales',
  RKCM007: 'otro conector',
  RKEM001: 'lleva la marca de agua de otra tienda',
  RKPE001: 'lleva la marca de agua de otra tienda',
  RKRC001: 'ramal de otra forma y color',
  RKSH004: 'cable con otro número de hilos',
  RKBTS009: 'batería con otra marca y otra capacidad en la etiqueta',
  'Batería Plomo Gel 12V 27AH': 'batería con otra marca en la etiqueta',
  // Del grupo «equivalentes», las que al compararlas de cerca tampoco coinciden
  RKAC013: 'lleva el logotipo de otra tienda',
  RKAC033: 'acelerador negro con botonera, no el naranja',
  RKBR003: 'otra bornera',
  RKCM009: 'otro conector',
  RKSS001: 'otro altavoz',
  // Segunda pasada, con todas las limpias en una hoja (2026-09-15)
  RKSW005: 'lleva el logotipo de la tienda de origen (made-in-china)',
  RKSW002: 'lleva encima el logotipo naranja de otra tienda',
  'RKAC008-1': 'lleva detrás la marca de agua de otra tienda',
  RKRD005: 'lleva una marca de agua en diagonal',
  RKBB014: 'lleva «HELMAR» repetido encima como marca de agua',
  RKCZ020: 'la llanta sale cortada por la mitad',
}

const wb = XLSX.readFile(path.join(CARPETA, 'Fuentes de las fotos nuevas.xlsx'))
const filas = XLSX.utils
  .sheet_to_json(wb.Sheets['Fotos nuevas'], { header: 1 })
  .slice(4)
  .filter((r) => r[3])

const BARRA = String.fromCharCode(92) // las rutas del Excel vienen con barra invertida
const informe = { limpias: [], retiradas: [], sinFoto: [], errores: [] }

for (const r of filas) {
  const nombre = String(r[3])
  const sku = String(r[4] || '')
  const clave = sku || nombre
  const archivo = sku ? archivoDeSku(sku) : slugNombre(nombre)
  const rel = r[6] ? String(r[6]).split(BARRA).join('/') : null
  const motivo = NO_USAR[sku] ?? NO_USAR[nombre]

  // Sin foto antes que con la marca de agua de Bicyrekkord: se borra la original
  // que dejó parts:photos y la tarjeta muestra el icono de su categoría hasta
  // que llegue una foto limpia del repuesto correcto.
  const retirarOriginal = () => {
    for (const { suf } of SIZES) rmSync(path.join(OUT, `${archivo}${suf}.webp`), { force: true })
  }
  if (!rel) {
    retirarOriginal()
    informe.sinFoto.push(clave)
    continue
  }
  if (motivo) {
    retirarOriginal()
    informe.retiradas.push(`${clave}: ${motivo}`)
    continue
  }

  try {
    const file = path.join(CARPETA, rel)
    if (!existsSync(file)) throw new Error('no existe el archivo')
    // Fondo blanco y sin margen sobrante
    const base = await sharp(file).flatten({ background: '#ffffff' }).trim({ threshold: 12 }).png().toBuffer()
    const { width: w, height: h } = await sharp(base).metadata()
    // Cuadrado con un 4 % de aire, sin ampliar la pieza: se rellena con blanco
    const lado = Math.round(Math.max(w, h) * 1.08)
    const izq = Math.floor((lado - w) / 2)
    const arriba = Math.floor((lado - h) / 2)
    const cuadrado = await sharp(base)
      .extend({ left: izq, right: lado - w - izq, top: arriba, bottom: lado - h - arriba, background: '#ffffff' })
      .png()
      .toBuffer()
    for (const { w: ancho, suf } of SIZES) {
      await sharp(cuadrado)
        .resize(ancho, ancho, { withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(path.join(OUT, `${archivo}${suf}.webp`))
    }
    informe.limpias.push(clave)
  } catch (e) {
    informe.errores.push(`${clave}: ${String(e.message).slice(0, 80)}`)
  }
}

writeFileSync('scripts/data/repuestos-fotos-limpias.json', JSON.stringify(informe, null, 1))
console.log(
  `${informe.limpias.length} con foto sin marca · ${informe.retiradas.length} sin foto (solo había con marca de agua) · ` +
    `${informe.sinFoto.length} sin foto nueva · ${informe.errores.length} errores`,
)
for (const o of informe.retiradas) console.log('  sin foto →', o)
for (const e of informe.errores) console.log('  ERROR →', e)
if (informe.errores.length) process.exitCode = 1
