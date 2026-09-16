/**
 * Primera carga de `moto_overrides`: una fila por cada modelo del catálogo
 * estático (`src/data/motos.ts`), con sus valores actuales. A partir de ahí,
 * el panel de administración es quien manda sobre precio, precio anterior,
 * oferta y publicado — el archivo estático deja de tocarse para eso.
 *
 * Es seguro volver a ejecutarlo: `on conflict do nothing` no pisa lo que el
 * administrador ya haya cambiado. Para un modelo NUEVO que se agregue más
 * adelante al catálogo estático, correr esto de nuevo le crea su fila.
 *
 *   node --env-file=.env.local scripts/db-seed-motos.mjs
 */
import { sql } from '@vercel/postgres'
import { MOTOS } from '../src/data/motos.ts'

let creadas = 0
for (const m of MOTOS) {
  const r = await sql`
    insert into moto_overrides (moto_id, price, old_price, on_sale, published)
    values (${m.id}, ${m.price ?? null}, ${m.oldPrice ?? null}, ${Boolean(m.oldPrice)}, true)
    on conflict (moto_id) do nothing
  `
  if (r.rowCount) creadas++
}
console.log(`${creadas} filas nuevas de ${MOTOS.length} motos (las que ya existían no se tocaron).`)
