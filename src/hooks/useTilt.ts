import { useCallback, useEffect, useRef } from 'react'

/**
 * Inclinación 3D suave siguiendo el cursor + posición del brillo.
 * Solo se activa con puntero fino (mouse/trackpad) y si el usuario
 * no pidió reducir movimiento: en táctil la tarjeta queda plana y la
 * interacción se resuelve con :active, sin depender de hover.
 *
 * Escribe variables CSS en el elemento:
 *   --rx / --ry  → rotaciones en grados
 *   --mx / --my  → posición del cursor en % (para el brillo)
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 7) {
  const ref = useRef<T | null>(null)
  const frame = useRef(0)
  const enabled = useRef(false)

  useEffect(() => {
    enabled.current =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const onMove = useCallback(
    (e: React.PointerEvent<T>) => {
      const el = ref.current
      if (!el || !enabled.current) return

      cancelAnimationFrame(frame.current)
      const { left, top, width, height } = el.getBoundingClientRect()
      const px = (e.clientX - left) / width
      const py = (e.clientY - top) / height

      frame.current = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
        el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
        el.style.setProperty('--mx', `${px * 100}%`)
        el.style.setProperty('--my', `${py * 100}%`)
      })
    },
    [max],
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(frame.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return { ref, onPointerMove: onMove, onPointerLeave: onLeave }
}
