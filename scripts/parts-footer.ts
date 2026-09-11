/* ---------------------------------------------------------------- */
/*  Derivados: nada de esto se escribe a mano                        */
/* ---------------------------------------------------------------- */

/** Categorías con su número de piezas, de más surtida a menos */
export const CATEGORIAS_REPUESTO = (() => {
  const cuenta = new Map<string, number>()
  for (const r of REPUESTOS) cuenta.set(r.category, (cuenta.get(r.category) ?? 0) + 1)
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, total]) => ({ id, total }))
})()

const conPrecio = REPUESTOS.filter((r) => r.price)

export const STATS_REPUESTOS = {
  total: REPUESTOS.length,
  categorias: CATEGORIAS_REPUESTO.length,
  minPrice: conPrecio.length ? Math.min(...conPrecio.map((r) => r.price!)) : 0,
  ofertas: REPUESTOS.filter((r) => r.oldPrice).length,
}

/** Rutas de la foto, o null si esa pieza aún no tiene */
export function photoOfPart(r: Repuesto) {
  if (!r.image) return null
  return {
    src: `/repuestos/${r.image}.webp`,
    src2x: `/repuestos/${r.image}@2x.webp`,
    srcSet: `/repuestos/${r.image}.webp 360w, /repuestos/${r.image}@2x.webp 720w`,
  }
}
