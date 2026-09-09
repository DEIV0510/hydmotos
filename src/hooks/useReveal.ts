import { useEffect, useRef, useState } from 'react'

/**
 * Añade la clase `is-in` cuando el elemento entra en viewport.
 * Se usa junto con `.reveal` / `.draw` de index.css.
 * Observa una sola vez: al revelarse deja de escuchar.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return

    // Sin IntersectionObserver o con motion reducido: mostrar de inmediato.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin, threshold: 0.06 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, shown])

  return { ref, shown }
}
