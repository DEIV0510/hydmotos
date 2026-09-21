/**
 * Crea las tablas del panel de administración en Postgres (Neon, vía la
 * integración de Vercel). Se puede ejecutar varias veces sin romper nada
 * (todo `create table if not exists`).
 *
 * Necesita las variables de entorno de la base de datos: en local, ya están
 * en `.env.local` (las bajó `vercel env pull`); en producción las tiene
 * Vercel automáticamente.
 *
 *   node --env-file=.env.local scripts/db-migrate.mjs
 */
import { sql } from '@vercel/postgres'

await sql`
  create table if not exists moto_overrides (
    moto_id text primary key,
    -- integer (hasta ~2.147 millones), no bigint: los precios no se acercan a
    -- ese límite y así el driver de Postgres los da como number de JS, no como
    -- string (bigint sí vendría como string, para no perder precisión)
    price integer,
    old_price integer,
    on_sale boolean not null default false,
    published boolean not null default true,
    updated_at timestamptz not null default now()
  )
`
console.log('✓ moto_overrides')

// Fase 2: imagen subida desde el panel (URL completa de Vercel Blob). Null =
// sigue mostrando la foto del catálogo estático, como hasta ahora.
await sql`alter table moto_overrides add column if not exists image text`
console.log('✓ moto_overrides.image')

await sql`
  create table if not exists repuesto_overrides (
    repuesto_id text primary key,
    price integer,
    old_price integer,
    on_sale boolean not null default false,
    published boolean not null default true,
    image text,
    updated_at timestamptz not null default now()
  )
`
console.log('✓ repuesto_overrides')

await sql`
  create table if not exists admin_audit_log (
    id bigserial primary key,
    actor text not null,
    action text not null,
    detail jsonb,
    created_at timestamptz not null default now()
  )
`
console.log('✓ admin_audit_log')

console.log('Listo.')
