/**
 * 🎬 VIDEOS DEL BANNER DE DESCUENTOS
 * ---------------------------------------------------------------
 * Para añadir uno: deja el archivo en public/promos/ (MP4, idealmente de menos
 * de 8 MB para que cargue rápido en el celular) y agrégalo a la lista. El
 * primero de la lista es el que se ve.
 *
 * Mientras la lista esté vacía, el banner muestra solo las ofertas: nunca un
 * reproductor vacío.
 */
export type VideoPromo = {
  /** Ruta dentro de public, p. ej. '/promos/oferta-septiembre.mp4' */
  src: string
  /** Imagen fija mientras carga (opcional), p. ej. '/promos/oferta-septiembre.jpg' */
  poster?: string
  /** Qué muestra el video, para lectores de pantalla */
  titulo: string
}

export const VIDEOS_PROMO: VideoPromo[] = []
