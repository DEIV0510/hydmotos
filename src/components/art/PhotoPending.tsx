import { IconCamera } from '@/components/art/Icons'

/**
 * Aviso para los modelos que todavía no tienen foto.
 *
 * Antes iba en su lugar una silueta vectorial, pero dibujar una moto que no es
 * la del modelo confunde más de lo que ayuda: el cliente pidió decir
 * claramente que la foto falta. Deja el hueco marcado, con el mismo alto que
 * una foto para que la tarjeta no cambie de tamaño.
 */
export default function PhotoPending({
  name,
  size = 'card',
}: {
  name: string
  /** 'card' en la rejilla, 'modal' en la ficha ampliada */
  size?: 'card' | 'modal'
}) {
  if (size === 'modal') {
    return (
      <div
        role="img"
        aria-label={`Foto pendiente de ${name}`}
        className="mx-auto flex aspect-square w-full max-w-[420px] flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-ink/15 bg-paper2/70 text-slate"
      >
        <IconCamera className="h-10 w-10 opacity-45" />
        <p className="text-[12px] font-semibold uppercase tracking-widest2">Foto pendiente</p>
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={`Foto pendiente de ${name}`}
      className="flex h-full w-full items-end justify-center rounded-2xl border border-dashed border-ink/15 bg-paper2/70 pb-3 text-slate"
    >
      {/*
        En una línea y pegado abajo: arriba a la izquierda se apilan las
        etiquetas de oferta y matrícula, y en el móvil, con la rejilla a dos
        columnas, el marco se queda tan bajo que un aviso centrado queda debajo
        de ellas.
      */}
      <span className="flex items-center gap-1.5">
        <IconCamera className="h-4 w-4 shrink-0 opacity-45" />
        {/* Sin partir en dos líneas: en el móvil la tarjeta es estrecha y
            «FOTO / PENDIENTE» descolocaba el icono. */}
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide">
          Foto pendiente
        </span>
      </span>
    </div>
  )
}
