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

// Fase 3: contenido del sitio editable desde /admin/contenido (Hero, contacto,
// WhatsApp, SEO, menú). Una fila por sección, no una tabla por campo: así se
// pueden agregar campos nuevos a futuro sin otra migración.
await sql`
  create table if not exists site_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now()
  )
`
console.log('✓ site_settings')

// Semilla con el contenido real que ya está en el sitio hoy (site.ts, wa.ts,
// index.html): `on conflict do nothing` para no pisar lo que el admin ya haya
// cambiado si esto se vuelve a correr.
const semillaSettings = {
  hero: {
    kicker: 'Movilidad eléctrica',
    title1: 'La ciudad,',
    title2: 'sin gasolina',
    ctaLabel: 'Ver modelos',
    ctaHref: '#motos',
    poster: null,
  },
  contact: {
    phone: '310 206 3400',
    whatsapp: '573102063400',
    email: '',
    address: 'Calle 44 #3-98',
    city: 'Montería',
    schedule: '',
    mapsUrl: '',
  },
  whatsapp: {
    generalMessage: 'Hola, quiero información sobre las motos, patinetas y carros eléctricos de H&D MOTORENS.',
    productMessageTemplate:
      'Hola, quiero comprar la moto {PRODUCT_NAME} que vi en la web de H&D MOTORENS. ¿Me confirman precio y disponibilidad?',
  },
  seo: {
    metaTitle: 'H&D MOTORENS | Motos, patinetas y carros eléctricos',
    metaDescription:
      'Motos, patinetas y carros eléctricos, taller y más de 130 repuestos con precio. Consulta y compra por WhatsApp en H&D MOTORENS.',
    ogTitle: 'H&D MOTORENS | Motos, patinetas y carros eléctricos',
    ogDescription:
      'Motos, patinetas y carros eléctricos, taller y más de 130 repuestos con precio. Consulta y compra por WhatsApp en H&D MOTORENS.',
    ogImage: 'https://www.hydmotorens.com/og.jpg',
    canonical: 'https://www.hydmotorens.com/',
  },
  social: { instagram: '', facebook: '', tiktok: '', youtube: '' },
  nav: {
    items: [
      { id: 'motos', label: 'Motos', href: '#motos', enabled: true, newTab: false, order: 0 },
      { id: 'patinetas', label: 'Patinetas', href: '#patinetas', enabled: true, newTab: false, order: 1 },
      { id: 'carros', label: 'Carros eléctricos', href: '#carros', enabled: true, newTab: false, order: 2 },
      { id: 'taller', label: 'Taller', href: '#taller', enabled: true, newTab: false, order: 3 },
      { id: 'repuestos', label: 'Repuestos', href: '#repuestos', enabled: true, newTab: false, order: 4 },
    ],
  },
}

let sembradas = 0
for (const [key, value] of Object.entries(semillaSettings)) {
  const r = await sql`
    insert into site_settings (key, value) values (${key}, ${JSON.stringify(value)})
    on conflict (key) do nothing
  `
  if (r.rowCount) sembradas++
}
console.log(`✓ site_settings sembrada (${sembradas} secciones nuevas de ${Object.keys(semillaSettings).length})`)

// Fase 3b: productos creados desde el panel, no del catálogo estático (el
// cliente pidió poder "añadir otras referencias" que build-catalog.mjs no
// generó). Tabla aparte de moto_overrides/repuesto_overrides: esas dos
// siguen intactas, solo para lo que YA existe en motos.ts/repuestos.ts.
await sql`
  create table if not exists custom_motos (
    id text primary key,
    name text not null,
    category text not null,
    price integer,
    old_price integer,
    on_sale boolean not null default false,
    published boolean not null default true,
    image text,
    range integer,
    speed integer,
    power integer,
    battery text,
    capacity text,
    brakes text,
    description text,
    soat boolean not null default false,
    matricula boolean not null default false,
    tecnomecanica boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )
`
console.log('✓ custom_motos')

await sql`
  create table if not exists custom_repuestos (
    id text primary key,
    name text not null,
    category text not null,
    sub text,
    sku text,
    icon text not null default 'tools',
    price integer,
    old_price integer,
    on_sale boolean not null default false,
    published boolean not null default true,
    image text,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )
`
console.log('✓ custom_repuestos')

console.log('Listo.')
