/**
 * Primera carga de `repuesto_overrides`: una fila por cada pieza del catálogo
 * estático (`src/data/repuestos.ts`), con sus valores actuales. Mismo patrón
 * que `db-seed-motos.mjs`.
 *
 * Es seguro volver a ejecutarlo: `on conflict do nothing` no pisa lo que el
 * administrador ya haya cambiado.
 *
 *   node --env-file=.env.local scripts/db-seed-repuestos.mjs
 */
import { sql } from '@vercel/postgres'
import { REPUESTOS } from '../src/data/repuestos.ts'

let creadas = 0
for (const r of REPUESTOS) {
  const fila = await sql`
    insert into repuesto_overrides (repuesto_id, price, old_price, on_sale, published)
    values (${r.id}, ${r.price ?? null}, ${r.oldPrice ?? null}, ${Boolean(r.oldPrice)}, true)
    on conflict (repuesto_id) do nothing
  `
  if (fila.rowCount) creadas++
}
console.log(`${creadas} filas nuevas de ${REPUESTOS.length} repuestos (las que ya existían no se tocaron).`)
