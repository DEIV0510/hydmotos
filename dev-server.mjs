// Arranca Vite con el cwd del proyecto para que Tailwind/PostCSS
// resuelvan sus configs y rutas `content` correctamente.
import { createServer } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
process.chdir(root)

const server = await createServer({
  root,
  server: { port: Number(process.env.PORT) || 5327, strictPort: true },
})
await server.listen()
server.printUrls()
