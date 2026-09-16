import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Solo en desarrollo: Vite no sabe servir /api (son funciones de Vercel).
    // `vercel dev` sí las sirve; correrlo aparte y redirigir aquí evita tener
    // que levantar todo el proyecto a través de `vercel dev` (más lento y,
    // en esta máquina, con problemas para servir los propios archivos de Vite).
    proxy: { '/api': 'http://localhost:3000' },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
})
