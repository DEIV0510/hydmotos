/**
 * Prepara el vídeo del local para la web.
 * El original son 100 s a 60 fps con audio y pesa 20 MB: demasiado para
 * cargarlo en una página. Se recorta un fragmento del recorrido por el
 * showroom, se quita el audio (los vídeos ambientales van en silencio),
 * se baja a 30 fps y se generan MP4 + WebM además del póster.
 *
 *   node scripts/build-video.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

const FFMPEG =
  'C:/Users/Lenovo/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0-full_build/bin/ffmpeg.exe'
const SRC = 'C:/Users/Lenovo/Desktop/motors/motos.mp4'
const OUT = 'public/video'
mkdirSync(OUT, { recursive: true })

const START = '00:00:01'
const DUR = '18'
const SCALE = 'scale=480:-2'

const run = (args) => execFileSync(FFMPEG, ['-y', '-v', 'error', ...args], { stdio: 'inherit' })

console.log('MP4…')
run([
  '-ss', START, '-i', SRC, '-t', DUR,
  '-an',                       // sin audio
  '-vf', `${SCALE},fps=30`,
  '-c:v', 'libx264', '-profile:v', 'main', '-crf', '30', '-preset', 'slow',
  '-movflags', '+faststart',   // permite empezar a reproducir sin descargar todo
  path.join(OUT, 'showroom.mp4'),
])

console.log('WebM…')
run([
  '-ss', START, '-i', SRC, '-t', DUR,
  '-an',
  '-vf', `${SCALE},fps=30`,
  '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-deadline', 'good', '-cpu-used', '2',
  path.join(OUT, 'showroom.webm'),
])

console.log('Póster…')
run(['-ss', '00:00:02', '-i', SRC, '-frames:v', '1', '-vf', 'scale=480:-2', path.join(OUT, 'showroom-poster.jpg')])

for (const f of ['showroom.mp4', 'showroom.webm', 'showroom-poster.jpg']) {
  const kb = Math.round(statSync(path.join(OUT, f)).size / 1024)
  console.log(`  ${f}: ${kb} kB`)
}
