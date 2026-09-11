# H&D MOTORENS

Web de catálogo para **H&D MOTORENS** — 74 motos eléctricas y 135 repuestos.
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
botón flotante, el del navbar, el de cada tarjeta, el del detalle, los
destacados y los «Pedir» de repuestos, cada uno con el nombre de la moto —o el
del repuesto y su referencia— ya escrito en el mensaje.

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

Todo sale de la carpeta `motors/` y se procesa con scripts. El pipeline
completo, en orden, es un solo comando:

```bash
npm run assets
```

que encadena estos pasos (también ejecutables por separado):

| Comando | Qué hace |
|---|---|
| `npm run assets:excel` | Lee el Excel → `scripts/data/excel.json` |
| `npm run assets:pick` | Puntúa las 838 fotos → `scripts/data/picks.json` |
| `npm run assets:photos` | Recorta y exporta a `public/motos/` |
| `npm run catalog` | Genera `src/data/motos.ts` |

Aparte, y solo cuando cambie ese material:

```bash
npm run assets:logo    # recorta y exporta el logo oficial
npm run assets:video   # comprime el vídeo del local
```

Para revisar qué falta:

```bash
npm run audit           # resumen: fotos, precios, fichas
npm run audit:missing   # candidatos para los modelos sin foto
npm run audit:sheet out # hoja de contacto de las fotos ya procesadas
```

Los intermedios viven en `scripts/data/` y están versionados, así que el
catálogo se puede regenerar sin tener el Excel ni la carpeta de fotos a mano.

### Los PDF de catálogo

`motors/` incluye cuatro catálogos en PDF (Biológica, Brenson, Mobulaa, NIU).
**No se usan en el build**: son una maquetación del mismo material que ya está
en el Excel y en las carpetas de fotos, con las imágenes incrustadas sin
recomprimir. Sirven como referencia para comprobar datos a ojo.

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
agua; se usan tal cual, por decisión tuya. Las cinco que el cliente pidió
quitar están en la constante DESCARTADAS de ese mismo script.

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

## Repuestos

La sección `#repuestos` lleva **135 referencias reales** del Excel
`Repuestos_Bicyrekkord.xlsx`: nombre, categoría, referencia, precio y
descripción tal como vienen del proveedor. Todas tienen precio; a diferencia de
las motos, aquí sí se muestran porque el Excel los trae completos.

```bash
npm run parts:excel    # Excel → scripts/data/repuestos-excel.json
npm run parts:photos   # saca las fotos del PDF → public/repuestos/
npm run parts          # genera src/data/repuestos.ts
npm run audit:parts    # resumen; --sinfoto lista las que faltan
```

Las fotos salen de `Catalogo_Bicyrekkord_Repuestos.pdf`, que las lleva
incrustadas. El catálogo abre cada producto con una página de ficha —nombre,
referencia y precio— y detrás coloca una o varias páginas solo con fotos, así
que el extractor no mira página a página: arrastra el producto activo y se
queda con la imagen más grande que aparezca hasta la ficha siguiente. Sin eso,
los productos cuya ficha no lleva imagen encima (los controladores VOTOL, los
cargadores de litio, el conjunto impermeable) se quedaban sin foto teniéndola.

**134 de 135 tienen foto.** La única que no es «Motor 500W-48V/60V, Rin 10´»:
el catálogo del proveedor no trae ninguna imagen para ese motor, así que se
muestra con el icono de su categoría en vez de con la foto de otro motor.

El orden del array intercala categorías —una pieza de cada una por ronda— para
que la primera pantalla no sean ocho aceleradores casi iguales. Al filtrar por
categoría se respeta el orden del proveedor.

Las fotos llevan la marca de agua del proveedor, igual que las de las motos.

---

## Estructura

```
scripts/                  ← generadores (catálogo, repuestos, fotos, logo, vídeo)
src/
├── data/
│   ├── motos.ts          ← GENERADO: catálogo de 74 modelos
│   ├── repuestos.ts      ← GENERADO: 135 repuestos
│   └── site.ts           ← WhatsApp, contacto, redes, navegación
├── lib/
│   ├── wa.ts             ← enlaces y mensajes de WhatsApp
│   └── img.ts            ← fetchPriority sin el aviso de React 18
├── hooks/                ← useReveal, useTilt
└── components/
    ├── art/              ← Logo, Icons, PhotoPending (aviso de foto que falta)
    ├── ui/Primitives.tsx ← Reveal, SectionHead, Button
    ├── LoadingScreen · Navbar · Hero · Marquee
    ├── Catalog · MotoCard · MotoModal · Highlights
    ├── Benefits · Process · Services · Showroom · CTA
    ├── Parts · PartModal
    └── Contact · Footer · WhatsAppButton · StructuredData
```

---

## Estado de las fotos

```bash
npm run audit:photos          # lista qué falta y qué conviene reemplazar
npm run audit:sheet-of out.jpg <id> <id>   # hoja de contacto de esos modelos
```

De aquella lista, **cinco ya no se publican**: el cliente pidió quitarlas el
2026-09-11 y ahora avisan «Foto pendiente» (`T3 – AIMA`, `MAK3 – AIMA`,
`A500 – AIMA`, `TROGON – AIMA` y `PORTIVA – MAGMA`). Ver la sección
**Modelos que aún necesitan foto**.

**Quedan 5 con foto mejorable** (ninguna lleva precio propio, así que no
son urgentes):

| Modelo | Proveedor | Problema |
|---|---|---|
| FISHER 350 – Electrika | Biológica | foto del local |
| DAKOTA PRO | Brenson | la foto muestra tres motos a la vez |
| VERONA | Brenson | la foto muestra cuatro motos a la vez |
| VERA 2026 | Brenson | varias motos y piezas sueltas, muy pequeñas |
| GIRL 3 | Mobulaa | el recorte del fondo dejó una mancha |

La clasificación está **revisada a ojo** y anotada en `scripts/audit-photos.mjs`.
Se intentó detectar la marca de agua midiendo el contraste de la banda central,
pero daba 50 falsos positivos de 63: confundía el borde del vehículo con el
texto sobreimpreso.

Para sustituir cualquiera, deja el archivo en `public/motos/<id>.webp` y
`<id>@2x.webp` (900×900, fondo transparente).

## Modelos que aún necesitan foto

**Dieciséis de los 74.** En vez de una foto, la tarjeta y la ficha muestran el
aviso **«Foto pendiente»** (`src/components/art/PhotoPending.tsx`). Antes iba
ahí una silueta vectorial, pero dibujar una moto que no es la del modelo
confunde más de lo que ayuda: el cliente pidió decir claramente que falta.

**Once no aparecen en el material de los proveedores:**

`ZEUS` · `FAMILY Q` · `FAMILY PLUS` (los dos) · `MOTORENS` · `BIWI ELÉCTRICA`
· `CLASSIC RUN` · `MAGMA NEVA` · `FAMILY` · `CIELO` · `BEETLE`

`npm run audit:missing` busca candidatos cruzando nombre y cifras, y para
estos no encuentra ninguno fiable: las coincidencias son solo de cifras
genéricas (55 km / 40 km/h / 350 W lo comparten muchos modelos) y esas fotos
ya las usa otro modelo. **No se les asigna una foto ajena a propósito.**

**Cinco tenían foto y el cliente pidió quitarla** (2026-09-11), por marca de
agua de la tienda de origen, por ser de calle o parqueadero, o por ser un
render en vez de una foto:

`TROGON – AIMA` · `T3 – AIMA` · `PORTIVA – MAGMA` · `MAK3 – AIMA` · `A500 – AIMA`

Están en la constante `DESCARTADAS` de `scripts/build-photos.mjs`. Para
devolverles la foto, se borra el modelo de ese `Set` y se ejecuta
`npm run assets:photos && npm run catalog`.

Para añadir una foto nueva, basta con dejar el archivo en
`public/motos/<id>.webp` (y `<id>@2x.webp`) usando el id que muestra
`npm run audit --sinfoto`.

## Verificado

- **Datos:** los 19 modelos con precio validados campo por campo contra tu ficha.
  Los 135 repuestos salen del Excel sin tocar precios ni nombres.
- **Responsive:** 360, 375, 390, 768, 1024, 1440 y 1920 px sin scroll horizontal.
  El catálogo va a 2 columnas en móvil, 3 en portátil y 4 en pantalla grande.
- **Repuestos:** las 135 tarjetas cargan sin una sola imagen rota; el buscador
  encuentra por nombre, por referencia y sin tildes; el filtro por categoría,
  el «Ver más» hasta el final, el estado de «Sin resultados» y la ficha con
  `Esc` y foco atrapado, todos probados en el navegador.
- **Accesibilidad:** contraste AA verificado componiendo transparencias, foco
  visible por teclado, áreas táctiles ≥44 px, un solo `h1`, `alt` en todas las
  imágenes y soporte de `prefers-reduced-motion`.
- **Build:** TypeScript sin errores, consola del navegador limpia. ~116 kB gzip
  de código; las fotos y el vídeo se cargan bajo demanda.

## Notas

- **Ya no se dibuja ninguna moto por código.** Donde antes había siluetas
  vectoriales ahora hay fotos reales (hero, destacados, banner de cierre) o el
  aviso de «Foto pendiente». `MotoArt.tsx` sigue en el repo porque de él sale
  el tipo `MotoVariant` del catálogo, pero no se renderiza en ninguna parte y
  no pesa nada en el paquete: la importación es `import type`, que desaparece
  al compilar.
- El banner de cierre lleva **REINA** y el hero **TIGRE**: dos fotos distintas
  y las dos claras, porque una moto oscura recortada se pierde contra el
  grafito del fondo.
- Los destacados de «Lo más buscado» salen del dato real. Cuando el campeón de
  un criterio no tiene foto, la tarjeta va sin miniatura en lugar de elegir
  otro modelo, que haría falso el titular.
- Los textos de **Servicios** (`src/components/Services.tsx`) son una propuesta
  editable: ajústalos a lo que realmente ofreces.
- El asterisco de «Sin SOAT ni matrícula*» se refiere a que BIWI ELÉCTRICA y
  CLASSIC RUN sí los requieren, según tu ficha.
