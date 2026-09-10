// Arranca Vite con el cwd del proyecto para que Tailwind/PostCSS
// resuelvan sus configs y rutas `content` correctamente.
import { createServer } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
process.chdir(root)

const server = await createServer({
  root,
  // host:true expone el servidor en la red local: asi se puede abrir la web
  // desde el celular con la IP del PC (mismo WiFi), no solo en localhost.
  server: { host: true, port: Number(process.env.PORT) || 5327, strictPort: true },
})
await server.listen()
server.printUrls()
