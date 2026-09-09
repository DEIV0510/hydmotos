# H&D MOTORENS

Web de catálogo para **H&D MOTORENS** — motos eléctricas.
React 18 + Vite 5 + Tailwind 3 + TypeScript.

```bash
npm install
npm run dev      # http://localhost:5327
npm run build    # genera dist/
```

---

## ⚠️ Pendiente antes de publicar

### 1. Número de WhatsApp

Es lo único que bloquea la conversión. Abre **`src/data/site.ts`** y rellena:

```ts
export const WHATSAPP_NUMBER: string = '573001234567'  // sin +, sin espacios
```

Mientras esté vacío, todos los botones de cotizar llevan a la sección de
contacto en lugar de abrir un chat roto. Al ponerlo, se activan de golpe:
el botón flotante, el del navbar, el de cada tarjeta, el del detalle y los
destacados — todos con el nombre de la moto ya escrito en el mensaje.

### 2. Resto de datos de contacto

En el mismo archivo. **Las filas vacías no se muestran**, así que no queda
ningún hueco ni texto de relleno en la web:

```ts
export const PHONE   = ''   // Teléfono visible
export const EMAIL   = ''   // Correo
export const ADDRESS = ''   // Dirección / ciudad
export const SCHEDULE = 'Lunes a sábado · 8:00 a.m. – 6:00 p.m.'
export const SOCIAL = { instagram: '', facebook: '', tiktok: '' }
```

### 3. Fotos de las motos

Ahora mismo cada moto se muestra con una **ilustración vectorial propia**
(hay 5 siluetas: urbana, deportiva, trail, scooter y tricimotor).

Cuando tengas las fotos:

1. Guárdalas en `public/motos/` (por ejemplo `public/motos/urban.webp`).
2. En `src/data/motos.ts`, añade el campo `image` a esa moto:

```ts
{
  id: 'urban',
  name: 'URBAN',
  imageCode: '3lopc2ghol',        // código original del recurso
  image: '/motos/urban.webp',     // ← añadir esta línea
  ...
}
```

La tarjeta y el detalle cambian solos a la foto, ya con `loading="lazy"`,
`decoding="async"` y proporción reservada para que no salte el layout.
Formato recomendado: **WebP, 900×520, fondo transparente o oscuro**.

> El campo `imageCode` de cada moto guarda el código del recurso que
> entregaste, para que sea fácil emparejar cada archivo con su modelo.

---

## Catálogo

Todo el catálogo vive en **`src/data/motos.ts`**. Es la única fuente de
verdad: la web entera se alimenta de ese array.

Al añadir o editar una moto se actualizan **solos**, sin tocar nada más:

- el grid del catálogo y el contador de modelos
- los conteos de cada filtro por categoría
- el buscador (nombre, batería, capacidad, frenos, potencia…)
- los 6 ordenamientos (precio ↑↓, autonomía, velocidad, potencia, destacados)
- los 4 destacados de "Lo más buscado"
- las cifras del hero (autonomía máx., velocidad máx., precio desde)
- el badge de oferta y su porcentaje de descuento
- los datos estructurados de SEO (schema.org)

### Añadir una moto

Copia un objeto del array y ajusta los campos:

```ts
{
  ...base,                    // valores comunes del catálogo
  id: 'nuevo-modelo',         // único; si repites nombre, diferencia el id
  name: 'NUEVO MODELO',
  category: 'urbana',         // urbana | familiar | matricula | tricimotor
  price: 4_000_000,
  oldPrice: 4_500_000,        // opcional: activa el badge de OFERTA
  imageCode: 'abc123',
  art: 'street',              // street | sport | trail | scooter | trike
  range: 65,                  // km   → filtros y orden
  speed: 50,                  // km/h → filtros y orden
  power: 350,                 // W    → filtros y orden
  battery: 'Grafeno',
  capacity: '2 personas',
  brakes: 'Disco delantero y banda trasera',
  pedals: true,
  led: true,
  parkingLights: true,
}
```

`base` aporta los valores repetidos (espejos de lujo, llanta Sello Matic,
ciclovía, direccionales, alarma, stop y SOAT/matrícula/tecnomecánica en `false`).
Cualquiera se puede sobrescribir en la moto, como hacen BIWI y CLASSIC RUN.

### Nota sobre nombres repetidos

Hay **dos FAMILY PLUS** distintos, con ids `family-plus-5420` y
`family-plus-5200`. Son registros independientes a propósito: distinto
precio, autonomía, velocidad y motor. No los fusiones.

---

## Estructura

```
src/
├── data/
│   ├── motos.ts          ← catálogo (19 modelos) + derivados
│   └── site.ts           ← WhatsApp, contacto, redes, navegación
├── lib/wa.ts             ← enlaces y mensajes de WhatsApp
├── hooks/
│   ├── useReveal.ts      ← aparición al hacer scroll
│   └── useTilt.ts        ← inclinación 3D de las tarjetas
└── components/
    ├── art/              ← MotoArt (5 siluetas), Logo, Icons
    ├── ui/Primitives.tsx ← Reveal, SectionHead, Button
    ├── LoadingScreen · Navbar · Hero · Marquee
    ├── Catalog · MotoCard · MotoModal · Highlights
    ├── Benefits · Process · Services · CTA
    └── Contact · Footer · WhatsAppButton · StructuredData
```

---

## Verificado

- **Datos:** los 19 modelos validados campo por campo contra la ficha
  entregada (precio, precio anterior, autonomía, velocidad, motor, batería
  y código de imagen). 0 discrepancias.
- **Responsive:** 360, 390, 768, 1024, 1440 y 1920 px sin scroll horizontal.
- **Accesibilidad:** contraste AA verificado componiendo transparencias
  (0 fallos), foco visible por teclado, áreas táctiles ≥44 px, un solo `h1`,
  `alt` en todas las imágenes y soporte de `prefers-reduced-motion`.
- **Build:** TypeScript sin errores. ~73 kB gzip en total, sin imágenes raster.

## Notas de diseño

- No había logo original: el wordmark y el monograma están en
  `src/components/art/Logo.tsx`. Para cambiarlo, se toca solo ese archivo.
- Las siluetas de moto son vectores propios dibujados para este proyecto
  (`src/components/art/MotoArt.tsx`), no iconos de librería.
- Los textos de **Servicios** (`src/components/Services.tsx`) son una
  propuesta editable: ajústalos a lo que realmente ofrece el negocio.
- El asterisco de "Sin SOAT ni matrícula*" se refiere a que BIWI ELÉCTRICA y
  CLASSIC RUN sí los requieren, según la ficha entregada.
