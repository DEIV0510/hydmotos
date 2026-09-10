# H&D MOTORENS

Web de catálogo para **H&D MOTORENS** — motos eléctricas.
React 18 + Vite 5 + Tailwind 3 + TypeScript.

```bash
npm install
npm run dev      # http://localhost:5327 (también accesible desde el celular, ver abajo)
npm run build    # genera dist/
```

---

## ⚠️ Lo único pendiente: el número de WhatsApp

Abre **`src/data/site.ts`** y rellena:

```ts
export const WHATSAPP_NUMBER: string = '573001234567'  // sin +, sin espacios
```

Mientras esté vacío, todos los botones de cotizar llevan a la sección de
contacto en lugar de abrir un chat roto. Al ponerlo se activan de golpe: el
botón flotante, el del navbar, el de cada tarjeta, el del detalle y los
destacados, todos con el nombre de la moto ya escrito en el mensaje.

En el mismo archivo van teléfono, correo, dirección, horario y redes.
**Las filas vacías no se muestran**, así que no queda ningún hueco en la web.

---

## Ver la web desde el celular

El servidor de desarrollo ya escucha en la red local. Con el PC y el móvil en
el mismo WiFi:

1. Arranca `npm run dev`. En la consola aparecen dos direcciones.
2. Abre en el celular la que dice **Network** (algo como `http://192.168.x.x:5327`).

`http://localhost:5327` **solo funciona en el propio PC** — desde el móvil hay
que usar la IP de red.

---

## Catálogo

**74 modelos.** El archivo `src/data/motos.ts` está **generado**: no lo edites a
mano. Se construye con:

```bash
npm run catalog
```

que cruza tres fuentes:

| Fuente | Qué aporta |
|---|---|
| `scripts/build-catalog.mjs` → const `CLIENTE` | Los **19 modelos con precio**, tal como los enviaste |
| `motors/Descripciones_...xlsx` | Descripción, ficha técnica y colores de 63 modelos |
| `public/motos/` | Las fotos ya recortadas y optimizadas |

### Sobre los precios

Solo llevan precio **los 19 modelos de tu lista**. Los otros 55 muestran
«Precio por WhatsApp», porque el Excel trae los precios publicados por las
tiendas proveedoras (Evobike, Mobulaa, Brenson, Biológica, NIU) y no los tuyos.

Cuando tengas tus precios para el resto, añádelos en el array `CLIENTE` de
`scripts/build-catalog.mjs` y ejecuta `npm run catalog`.

> Ojo: para REINA, MOPED, TIGRE, POLAR y RYDER PRO tu precio y el del Excel no
> coinciden. Manda el tuyo.

### Añadir o cambiar una moto

Edita el array `CLIENTE` en `scripts/build-catalog.mjs` y ejecuta
`npm run catalog`. Se actualizan **solos**: el grid, el contador de modelos, los
conteos por categoría, el buscador, los seis ordenamientos, los destacados de
«Lo más buscado», las cifras del hero, el badge de oferta y el SEO estructurado.

Hay **dos FAMILY PLUS** distintos a propósito (`family-plus-5420` y
`family-plus-5200`): distinto precio, autonomía, velocidad y motor. No los fusiones.

---

## Imágenes, logo y vídeo

Todo sale de la carpeta `motors/` y se procesa con scripts:

```bash
npm run photos   # elige y recorta la foto de cada modelo
npm run logo     # recorta y exporta el logo oficial
npm run video    # comprime el vídeo del local
```

- **Fotos** (`scripts/build-photos.mjs`): de las 838 imágenes de la carpeta se
  elige automáticamente la mejor de cada modelo, midiendo la silueta para
  descartar planos de detalle (manillares, tableros) y quedarse con las de
  perfil completo. Luego se recorta el fondo con relleno desde los bordes y se
  exporta a WebP con transparencia en dos tamaños, para que la moto quede
  apoyada sobre el color de la tarjeta en vez de dentro de un recuadro blanco.
  Los modelos donde la elección automática falla se corrigen en la constante
  `MANUAL` de ese script.
- **Logo** (`scripts/build-logo.mjs`): recorta el PNG por su canal alfa y
  exporta el wordmark en dos anchos más el monograma del favicon.
- **Vídeo** (`scripts/build-video.mjs`): recorta 18 s del recorrido por el local,
  quita el audio y comprime de 20 MB a 1,5 MB. Se carga solo cuando la sección
  entra en pantalla.

Las fotos son de las tiendas proveedoras y varias llevan su marca impresa o de
agua; se usan tal cual, por decisión tuya.

---

## Fondos

La página alterna en tres bloques para no ser oscura de principio a fin:

1. **Oscuro** — hero y franja de ventajas.
2. **Claro** — catálogo, destacados, beneficios (`bg-paper2`, algo más marcado
   para dar ritmo), proceso y servicios.
3. **Oscuro** — local, CTA final, contacto y pie.

| Token | Valor | Uso |
|---|---|---|
| `void` / `graphite` | `#04060A` / `#0A0E15` | fondos oscuros |
| `paper` / `paper2` | `#F1F4F8` / `#E4E9F0` | fondos claros |
| `card` | `#FFFFFF` | tarjetas del bloque claro |
| `chrome` / `silver` | `#E6ECF4` / `#A5B2C3` | texto sobre oscuro |
| `ink` / `slate` | `#080C13` / `#4A5768` | texto sobre claro |

---

## Estructura

```
scripts/                  ← generadores (catálogo, fotos, logo, vídeo)
src/
├── data/
│   ├── motos.ts          ← GENERADO: catálogo de 74 modelos
│   └── site.ts           ← WhatsApp, contacto, redes, navegación
├── lib/wa.ts             ← enlaces y mensajes de WhatsApp
├── hooks/                ← useReveal, useTilt
└── components/
    ├── art/              ← Logo, Icons, MotoArt (5 siluetas de respaldo)
    ├── ui/Primitives.tsx ← Reveal, SectionHead, Button
    ├── LoadingScreen · Navbar · Hero · Marquee
    ├── Catalog · MotoCard · MotoModal · Highlights
    ├── Benefits · Process · Services · Showroom · CTA
    └── Contact · Footer · WhatsAppButton · StructuredData
```

---

## Verificado

- **Datos:** los 19 modelos con precio validados campo por campo contra tu ficha.
- **Responsive:** 360, 375, 390, 768, 1024, 1440 y 1920 px sin scroll horizontal.
  El catálogo va a 2 columnas en móvil, 3 en portátil y 4 en pantalla grande.
- **Distribución:** 6,3 pantallas en escritorio con 74 productos; el catálogo
  muestra 8 y amplía de 8 en 8.
- **Accesibilidad:** contraste AA verificado componiendo transparencias, foco
  visible por teclado, áreas táctiles ≥44 px, un solo `h1`, `alt` en todas las
  imágenes y soporte de `prefers-reduced-motion`.
- **Build:** TypeScript sin errores. ~99 kB gzip de código; las fotos y el vídeo
  se cargan bajo demanda.

## Notas

- Las siluetas vectoriales de `MotoArt.tsx` siguen usándose en los 12 modelos
  que aún no tienen foto y en el hero.
- Los textos de **Servicios** (`src/components/Services.tsx`) son una propuesta
  editable: ajústalos a lo que realmente ofreces.
- El asterisco de «Sin SOAT ni matrícula*» se refiere a que BIWI ELÉCTRICA y
  CLASSIC RUN sí los requieren, según tu ficha.
