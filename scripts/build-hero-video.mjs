/**
 * Prepara el vídeo del carro para la portada.
 *
 * El original son 10 s a 1280×720/24 fps con audio y pesa 5,5 MB. Como es de
 * fondo (autoplay, en bucle, sin sonido), se quita el audio y se genera en dos
 * anchos: el nativo para escritorio y uno más liviano para el celular, elegido
 * por `<source media>` en el navegador. Solo MP4: se probó también WebM (VP9)
 * y en esta escena —con mucho detalle fino en los neones— salía más pesado que
 * el MP4, así que no aporta nada.
 *
 * El póster es el primer fotograma, para que se vea algo antes de que cargue
 * el vídeo y como imagen fija si el visitante pidió menos movimiento.
 *
 *   node scripts/build-hero-video.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

const FFMPEG =
  'C:/Users/Lenovo/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe'
const SRC = 'C:/Users/Lenovo/Desktop/motors/carrohero.mp4'
const OUT = 'public/video'
mkdirSync(OUT, { recursive: true })

const run = (args) => execFileSync(FFMPEG, ['-y', '-v', 'error', ...args], { stdio: 'inherit' })

const variantes = [
  // Escritorio: se muestra en un marco de ~700 px, así que el ancho nativo
  // (1280) cubre pantallas de hasta ~2x sin ampliar nada.
  { nombre: 'hero', escala: 'scale=1280:-2', crf: 26 },
  // Celular: menos datos. El marco ahí mide entre 300 y 640 px CSS.
  { nombre: 'hero-mobile', escala: 'scale=640:-2', crf: 28 },
]

for (const v of variantes) {
  console.log(`${v.nombre}.mp4…`)
  run([
    '-i', SRC,
    '-an', // sin audio: es un fondo en bucle, silencioso
    '-vf', v.escala,
    '-c:v', 'libx264', '-profile:v', 'main', '-crf', String(v.crf), '-preset', 'slow',
    '-movflags', '+faststart', // permite empezar a reproducir sin descargar todo
    path.join(OUT, `${v.nombre}.mp4`),
  ])
}

console.log('hero-poster.jpg…')
run(['-i', SRC, '-frames:v', '1', '-vf', 'scale=1280:-2', path.join(OUT, 'hero-poster.jpg')])

for (const f of variantes.map((v) => `${v.nombre}.mp4`).concat('hero-poster.jpg')) {
  const kb = Math.round(statSync(path.join(OUT, f)).size / 1024)
  console.log(`  ${f}: ${kb} kB`)
}
