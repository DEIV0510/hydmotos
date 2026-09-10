/**
 * Logo oficial de H&D MOTORENS.
 * Archivo entregado por el cliente, recortado por su canal alfa y exportado
 * en dos anchos por `scripts/build-logo.mjs`. Para cambiarlo basta con
 * reemplazar `motors/logo.png` y volver a ejecutar ese script.
 *
 * La marca ya contiene el nombre, así que la imagen lleva el texto
 * alternativo y no se repite en texto al lado.
 */

const SRC_280 = '/marca/logo-280.webp'
const SRC_560 = '/marca/logo-560.webp'
const RATIO = 1159 / 661 // proporción real del contenido del logo

export function Logo({
  className = '',
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  // Altura de referencia; el ancho se deriva de la proporción para no deformarlo
  const h = compact ? 46 : 60
  const w = Math.round(h * RATIO)

  return (
    <img
      src={SRC_280}
      srcSet={`${SRC_280} 280w, ${SRC_560} 560w`}
      sizes={`${w}px`}
      width={w}
      height={h}
      alt="H&D MOTORENS"
      decoding="async"
      className={`block h-auto w-auto object-contain ${className}`}
      style={{ height: h }}
    />
  )
}

/** Solo el monograma H&D, para la pantalla de carga */
export function LogoMark({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      src="/marca/monograma.png"
      width={size}
      height={Math.round(size * 0.42)}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={`block object-contain ${className}`}
      style={{ width: size }}
    />
  )
}
