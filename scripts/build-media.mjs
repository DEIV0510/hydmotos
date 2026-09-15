/**
 * Prepara los recursos gráficos que no son fichas de producto: las fotos del
 * carro para la portada, las del carro pequeño para la sección de carros
 * eléctricos y el material de marca de MAGMA (banner, piezas informativas y
 * fotos de detalle).
 *
 *   node scripts/build-media.mjs
 *
 * Escribe public/carro, public/carro-mini, public/magma, public/og.jpg y
 * src/data/media.ts.
 * Nunca amplía: el ancho mayor es el de la imagen original. Los textos
 * alternativos describen solo lo que se ve en cada imagen.
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const SRC = 'C:/Users/Lenovo/Desktop/motors'

const GRUPOS = [
  {
    nombre: 'CARRO',
    dir: 'carro',
    anchos: [640, 960, 1280],
    lqip: true,
    items: [
      { id: 'tres-cuartos', file: 'carro4.png', alt: 'Carro plateado de cinco puertas visto de tres cuartos' },
      { id: 'lateral', file: 'carro2.png', alt: 'Carro plateado de cinco puertas visto de lado' },
      { id: 'frente', file: 'carro3.png', alt: 'Carro plateado visto de frente' },
      { id: 'faro', file: 'carro.png', alt: 'Detalle del faro delantero del carro plateado' },
    ],
  },
  {
    nombre: 'MAGMA',
    dir: 'magma',
    anchos: [380, 760],
    items: [
      { id: 'bubble-faro', file: 'banner.png', alt: 'MAGMA Bubble: detalle del faro redondo y del logotipo' },
      { id: 'potencia', file: 'info.png', alt: 'MAGMA: potencia para subir' },
      { id: 'bateria-extraible', file: 'info2.png', alt: 'MAGMA: batería de litio extraíble' },
      { id: 'carga-rapida', file: 'info3.png', alt: 'MAGMA: carga más rápida' },
      {
        id: 'bateria-ciclos',
        file: 'info4.png',
        alt: 'MAGMA: batería de larga vida. Plomo 450 ciclos, litio común 900 ciclos, TIANENG-MAGMA más de 1.500 ciclos',
      },
      { id: 'garantia-motor', file: 'info5.png', alt: 'MAGMA: garantía de motor de 5 años' },
      { id: 'detalle-freno', file: 'magma.png', alt: 'Detalle MAGMA: freno de disco delantero' },
      { id: 'detalle-respaldo', file: 'magma2.png', alt: 'Detalle MAGMA: respaldo con el logotipo de la marca' },
      { id: 'detalle-asiento', file: 'magma3.png', alt: 'Detalle MAGMA: asientos sobre carrocería roja' },
      { id: 'detalle-rueda', file: 'magma4.png', alt: 'Detalle MAGMA: rueda delantera con freno de disco' },
      { id: 'detalle-amortiguador', file: 'magamrespuesot.png', alt: 'Detalle MAGMA: amortiguador trasero' },
    ],
  },
  {
    // Las cinco fotos .jpg.jpeg de la raíz: un carro pequeño azul claro de dos
    // puertas. Sin nombre ni datos; va en la sección de carros eléctricos
    nombre: 'CARRO_MINI',
    dir: 'carro-mini',
    anchos: [480, 960],
    items: [
      { id: 'tres-cuartos', file: '1556198b-d8ed-4357-afc2-3a7307d85878.jpg.jpeg', alt: 'Carro eléctrico pequeño azul claro con techo blanco, visto de tres cuartos' },
      { id: 'frente', file: 'ed2ce9a8-3088-4feb-88e4-9d0f4cd6ae30.jpg.jpeg', alt: 'Carro eléctrico pequeño azul claro visto de frente' },
      { id: 'trasera-tres-cuartos', file: 'c09549f1-5f48-4d23-aa94-4c4f01555dba.jpg.jpeg', alt: 'Carro eléctrico pequeño azul claro visto desde atrás, de tres cuartos' },
      { id: 'trasera', file: 'c151dae2-ffd1-4810-bc43-844dbbc604ea.jpg.jpeg', alt: 'Parte trasera del carro eléctrico pequeño azul claro' },
    ],
  },
]

const salida = {}
for (const g of GRUPOS) {
  const out = path.join('public', g.dir)
  mkdirSync(out, { recursive: true })
  salida[g.nombre] = []

  for (const it of g.items) {
    const file = path.join(SRC, it.file)
    const meta = await sharp(file).metadata()
    // Sin ampliar nunca: los anchos que superan el original se descartan
    const anchos = [...new Set(g.anchos.map((a) => Math.min(a, meta.width)))]
    const rutas = []
    for (const a of anchos) {
      const nombre = `${it.id}-${a}.webp`
      await sharp(file).removeAlpha().resize({ width: a }).webp({ quality: 82 }).toFile(path.join(out, nombre))
      rutas.push({ a, url: `/${g.dir}/${nombre}` })
    }
    const alto = Math.round((meta.height * anchos[anchos.length - 1]) / meta.width)
    const item = {
      id: it.id,
      alt: it.alt,
      width: anchos[anchos.length - 1],
      height: alto,
      src: rutas[rutas.length - 1].url,
      srcSet: rutas.map((r) => `${r.url} ${r.a}w`).join(', '),
    }
    if (g.lqip) {
      // Vista previa difuminada de ~250 bytes para que la portada no salga en negro
      const mini = await sharp(file).removeAlpha().resize({ width: 24 }).webp({ quality: 40 }).toBuffer()
      item.lqip = `data:image/webp;base64,${mini.toString('base64')}`
    }
    salida[g.nombre].push(item)
  }
}

const cabecera = `// ⚠️ ARCHIVO GENERADO — no editar a mano. Lo escribe \`npm run media\`
//    (scripts/build-media.mjs) a partir de la carpeta Motors.

export type Media = {
  id: string
  alt: string
  width: number
  height: number
  src: string
  srcSet: string
  /** Vista previa diminuta en base64 para la carga progresiva */
  lqip?: string
}
`
const cuerpo = Object.entries(salida)
  .map(([k, v]) => `export const ${k}: Media[] = ${JSON.stringify(v, null, 2)}\n`)
  .join('\n')
writeFileSync('src/data/media.ts', `${cabecera}\n${cuerpo}`)

/**
 * Imagen para compartir el enlace (WhatsApp, Facebook, X): 1200×630 en JPG,
 * que es lo que leen todas; el SVG que había no lo muestra ninguna. Es la foto
 * de la portada recortada a ese formato, sin retoques ni textos encima.
 */
const portada = path.join(SRC, GRUPOS[0].items[0].file)
await sharp(portada)
  .removeAlpha()
  .resize(1200, 630, { fit: 'cover', withoutEnlargement: true })
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og.jpg')

for (const [k, v] of Object.entries(salida)) console.log(k, v.map((m) => `${m.id} ${m.width}x${m.height}`).join(' · '))
const og = await sharp('public/og.jpg').metadata()
console.log('public/og.jpg', `${og.width}x${og.height}`)
