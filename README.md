# H&D MOTORENS

Web de catálogo para **H&D MOTORENS**: motos (80 modelos), patinetas y carros
eléctricos, taller y 135 repuestos. React 18 + Vite 5 + Tailwind 3 + TypeScript.
En vivo en **https://hydmotos.vercel.app**: cada push a `main` se despliega solo.

```bash
npm install
npm run dev      # http://localhost:5327 (también accesible desde el celular, ver abajo)
npm run build    # genera dist/
```

---

## ⚠️ Pendiente del cliente

Abre **`src/data/site.ts`** y rellena:

```ts
export const WHATSAPP_NUMBER: string = '573001234567'  // sin +, sin espacios
```

Mientras esté vacío, todos los botones de consulta llevan a la sección de
contacto en lugar de abrir un chat roto. Al ponerlo se activan de golpe: el
botón flotante, el del menú, el del carro de la portada, el de cada tarjeta y
ficha, los de MAGMA y los «Pedir» de repuestos, cada uno con el nombre del
modelo —o del repuesto y su referencia— ya escrito en el mensaje.

En el mismo archivo van teléfono, correo, dirección, **horario** y redes. Las
filas vacías no se muestran. El horario está vacío a propósito: el que había lo
puse de ejemplo al crear la web y nunca se confirmó.

También faltan:

- **Patinetas eléctricas**: fotos, nombres y precios de los modelos. La sección
  existe (el menú la pide) pero no muestra ninguno inventado: invita a
  preguntar por WhatsApp y enseña los repuestos para patineta.
- **Carros eléctricos**: nombre, precio y ficha de los dos carros de las fotos
  (el plateado de 5 puertas y el azul claro de 2 puertas).
- **Taller**: qué trabajos hace. Mientras no llegue, la sección no enumera servicios.
- **Videos para el banner de descuentos**: se añaden en `src/data/promos.ts`.
- **Fotos limpias de 27 repuestos** que solo tenían foto con marca de agua (lista en «Repuestos»).
- **Foto de 6 motos**: MOTORENS, BIWI ELÉCTRICA, TRICIMOTOR ELÉCTRICO, T3, MAK3 y PORTIVA.
- **Qué cifras valen** en REINA, MOPED, RYDER PRO, TIGRE y POLAR (ver «Sobre los precios»).
- **Dominio propio**, si lo compras: la dirección de la web está en `index.html`,
  `src/components/StructuredData.tsx`, `public/robots.txt` y `public/sitemap.xml`.

---

## Recorrido de la página

El menú va por categorías, como pidió el cliente: **Motos · Patinetas · Carros
eléctricos · Taller · Repuestos**. El logo lleva al inicio y «Consultar», a WhatsApp.

| # | Sección | Para qué está |
|---|---|---|
| — | Portada (`Hero`) | El carro como protagonista, en su foto completa; WhatsApp y catálogo |
| — | Franja (`Marquee`) | Banda azul eléctrico con las categorías y datos del catálogo |
| — | Descuentos (`Descuentos`) | Banner con letras en 3D y las ofertas reales; admite videos (`src/data/promos.ts`) |
| 01 | Destacados (`Featured`) | Motos con precio y foto en un mosaico, ofertas primero; accesos por tipo |
| 02 | Motos (`Catalog`) | Las 80 motos con búsqueda, filtros, orden, ficha y botón «Comprar» |
| 03 | MAGMA (`Magma`) | La marca con más material propio: banner, piezas y acceso a sus modelos |
| 04 | Patinetas (`Patinetas`) | Sin modelos todavía: WhatsApp y los repuestos para patineta |
| 05 | Carros eléctricos (`Carros`) | Los dos carros de las fotos, con galería y «Comprar» |
| 06 | Taller (`Taller`) | Servicio técnico: WhatsApp y enlace a repuestos, sin servicios inventados |
| 07 | Repuestos (`Parts`) | 135 piezas con precio y botón «Comprar» |
| 08 | Por qué H&D (`Benefits`) | Cifras del catálogo y cómo comprar en tres pasos |
| 09 | El local (`Showroom`) | El vídeo real de la tienda |
| — | Cierre (`CTA`) | Llamada final con la foto del faro, completa |
| 10 | Contacto (`Contact`) | WhatsApp y los datos que estén configurados |

Alterna bloques oscuros y claros, con el azul eléctrico como hilo: oscuro
(portada, franja y descuentos) → claro (destacados y motos) → oscuro (MAGMA) →
claro (patinetas) → oscuro (carros y taller) → claro (repuestos y por qué H&D)
→ oscuro (local, cierre, contacto y pie).

Los accesos por tipo, MAGMA y los descuentos filtran el catálogo desde fuera con
un evento de ventana (`src/lib/catalogo.ts`) y bajan hasta él; patinetas, taller
y descuentos hacen lo mismo con los repuestos.

Destacados no es un «más vendidos», porque ese dato no existe: son modelos con
precio publicado y foto, las ofertas primero y después uno de cada tipo. Sale
del catálogo, así que cambia solo si cambian los datos.

### Qué afirma la web y qué no

Todo lo que dice la página sale del catálogo o del material del cliente. En el
rediseño se quitaron textos que puse de ejemplo y nadie confirmó: el horario,
«mantenimiento», «garantía y respaldo», «coordinamos la entrega», la forma de
pago, «todos los modelos en exhibición para ver y probar», «sin cita previa»,
«recarga en casa», «lo más buscado» y «respondemos rápido».

Las cifras de las piezas de MAGMA (ciclos de batería, garantía de motor de 5
años) están dentro de sus propias imágenes y se muestran tal cual, con la nota
de que dependen de cada modelo.

Patinetas, carros eléctricos y taller están porque el cliente los pidió como
categorías (notas de voz del 11 y el 15/09). Sin material de ellos, la web no
inventa modelos, precios ni servicios: enseña lo que hay (las fotos de los dos
carros, los repuestos para patineta) y lleva a WhatsApp. Los descuentos del
banner son los del catálogo, y los botones de producto dicen «Comprar».

---

## Ver la web desde el celular

El servidor de desarrollo ya escucha en la red local. Con el PC y el móvil en
el mismo WiFi:

1. Arranca `npm run dev`. En la consola aparecen dos direcciones.
2. Abre en el celular la que dice **Network** (algo como `http://192.168.x.x:5327`).

`http://localhost:5327` **solo funciona en el propio PC**: desde el móvil hay
que usar la IP de red.

---

## Catálogo

**80 modelos.** `src/data/motos.ts` está **generado**: no lo edites a mano. Se
construye con `npm run catalog`, que cruza:

| Fuente | Qué aporta |
|---|---|
| `scripts/build-catalog.mjs` → `CLIENTE` | Los **19 modelos con precio**, tal como los enviaste |
| `motors/Descripciones_...xlsx` | Descripción, ficha técnica y colores de otros 56 modelos |
| `scripts/build-catalog.mjs` → `NUEVOS` | 5 modelos nuevos de la carpeta Motors (15/09) |
| `public/motos/` | Las fotos ya procesadas |

### Sobre los precios

Solo llevan precio **los 19 modelos de tu lista**. Los otros 61 muestran
«Precio por WhatsApp», porque el Excel trae los precios de las tiendas
proveedoras y no los tuyos, y los modelos nuevos no traen ninguno.

Siete modelos tuyos llevan la foto y los colores del modelo que Evobike vende
con el mismo nombre: URBAN, URBEX, REINA, MOPED, RYDER PRO, TIGRE y POLAR. La
web muestra siempre **tu** precio y **tus** cifras. La descripción y la ficha
de la tienda solo se añaden cuando sus cifras coinciden con las tuyas, y eso
solo pasa en URBAN y URBEX.

> Ojo: en estos cinco tu lista y la tienda no coinciden. Para no mostrar en la
> ficha lo contrario que en la tarjeta, la web no enseña su descripción ni su
> ficha de la tienda. Confirma cuál es la buena:
>
> | Modelo | Tu lista | Evobike |
> |---|---|---|
> | REINA | $3.700.000 · 40 km | desde $3.320.000 · 65 km con 72 V |
> | MOPED | $3.200.000 · 550 W · 50 km/h · 65 km | desde $3.120.000 · 350 W · 38 km/h · 55 km |
> | RYDER PRO | $4.100.000 · 50 km/h | desde $4.220.000 · 40 km/h |
> | TIGRE | $4.000.000 · 50 km/h · 65 km | desde $4.120.000 · 40 km/h · 55 km |
> | POLAR | $4.000.000 · 50 km/h | desde $4.020.000 · 40 km/h |

> **TRICIMOTOR ELÉCTRICO**: iba con la foto y la descripción de la «Trimotos C1
> Tyson» de Mobulaa, y no es el mismo vehículo (la C1 tiene 650 W, 25–35 km/h,
> pide matrícula y cuesta $8.875.000). Se quitó: el tuyo sale con «Foto
> pendiente» y la C1 aparece aparte, sin precio. Si el tuyo sí es la C1,
> vuelve a unirlos en `FOTO_DE`.

### Modelos nuevos (15/09)

`MAGMA BUBBLE`, `MAGMA Q2 BOXTER`, `MAGMA X1`, `MAGMA ONE` y `X.BAW`. El nombre
se leyó en el propio material: «Bubble» en el banner de MAGMA, «Q2 BOXTER» en
`moto22`–`moto23`, «X1» en el depósito, «ONE» en el frontal y el costado, y
«SUPER BIKE X.BAW» en el frontal. No traen precio ni ficha, así que salen sin
cifras.

Quedan fuera porque no se lee el modelo con seguridad: la scooter MAGMA de
`moto5`–`moto13`, el triciclo MAGMA de `moto28`–`moto30` y la scooter negra de
`1.png` y `3 (1).png`. Sus fotos no se asocian a ningún producto.

`CLASSIC RUN`, que estaba en tu lista sin foto, aparece en `moto.png`–`moto4.png`
con «CLASSIC» y «RUN» impresos: ahora lleva la de `moto.png`.

### Modelos MAGMA

La sección de MAGMA lista los que llevan la marca en el nombre y los que su
ficha presenta como MAGMA: ÁGUILA («Moto Eléctrica ÁGUILA MAGMA»). Son 8, los
mismos que salen al buscar «magma» en el catálogo.

### Fichas técnicas

Ninguna fila lleva un valor por omisión. En los modelos del Excel la batería se
muestra como la escribe el proveedor («48V: Ácido de plomo»). Antes todo lo que
no decía «litio» salía como grafeno, y la llanta Sello Matic y los espejos de
lujo de tu ficha se colaban en modelos que no los declaran.

### Añadir o cambiar una moto

Edita `CLIENTE` en `scripts/build-catalog.mjs` y ejecuta `npm run catalog`. Se
actualizan **solos**: el catálogo, los contadores, los destacados, los accesos
por tipo, las cifras de la portada, el badge de oferta y el SEO estructurado.

Hay **dos FAMILY PLUS** distintos a propósito (`family-plus-5420` y
`family-plus-5200`): distinto precio, autonomía, velocidad y motor. No los
fusiones. En «Mejores fotos - 17 modelos» sus carpetas dicen de qué modelo es
cada uno: el de $5.420.000 es la Family Q Plus y el de $5.200.000, la Family Plus.

---

## Fotos de las motos

```bash
npm run assets   # excel → pick → photos → extra → catalog
```

| Comando | Qué hace |
|---|---|
| `npm run assets:excel` | Lee el Excel → `scripts/data/excel.json` |
| `npm run assets:pick` | Puntúa las 833 fotos de las tiendas → `scripts/data/picks.json` |
| `npm run assets:photos` | Recorta y exporta a `public/motos/` |
| `npm run assets:extra` | Fotos curadas, CLASSIC RUN y modelos nuevos |
| `npm run catalog` | Genera `src/data/motos.ts` |
| `npm run audit -- --sinfoto` | Resumen del catálogo y los modelos sin foto |

- **Tiendas** (`pick-photos.mjs` y `build-photos.mjs`): elige la mejor foto de
  cada modelo midiendo la silueta, recorta el fondo por relleno desde los bordes
  y exporta WebP con transparencia. `MANUAL` corrige elecciones y `DESCARTADAS`
  guarda las fotos que pediste no publicar. `pick-photos` se salta «Repuestos
  sin marca de agua» y «Mejores fotos», que no son carpetas de tiendas.
- **Extra** (`build-extra-photos.mjs`): renders oficiales y fotos limpias de
  «Mejores fotos - 17 modelos» (ZEUS, FAMILY Q, los dos FAMILY PLUS, FAMILY,
  BEETLE, GIRL 3, DAKOTA PRO, VERONA, VERA 2026, TROGON, A500, MAGMA NEVA y
  CIELO), la de CLASSIC RUN y las de los modelos nuevos. Quedan fuera T3 (el
  render solo enseña la parte trasera, cortada), MAK3 (la única foto lleva
  marca de agua) y FISHER 350 (la curada no mejora la que tiene).
- **Encuadre** (`encuadre.mjs`): las recortadas van centradas en un lienzo
  cuadrado. Las enteras van en el marco 4:3 de las tarjetas: se *recortan* por
  los lados si son 16:9, se *extienden* copiando el borde si son cuadradas
  sobre fondo de estudio y se *difuminan* si son escenas reales. Nunca se
  amplían.
- **`photoAspect`** (`npm run catalog`): mide por el alfa el alto real de cada
  moto recortada para poder encuadrarla sin aire.

**Sin foto quedan 6 de 80**: `BIWI ELÉCTRICA` y `MOTORENS` (no aparecen en
ninguna tienda con ese nombre), `TRICIMOTOR ELÉCTRICO` (ver arriba) y `T3`,
`MAK3` y `PORTIVA` (sin foto publicable). Muestran el aviso «Foto pendiente» en
vez de una moto dibujada.

Con foto mejorable: `FISHER 350` y `MAGMA NEVA` (fotos del local de Biologica)
y `CIELO` (foto de exterior de Emove). No existe render de ninguno.

Para añadir una foto a mano, deja `public/motos/<id>.webp` y `<id>@2x.webp`
usando el id que muestra `npm run audit -- --sinfoto`, y ejecuta `npm run catalog`.

---

## Portada, carro, iconos y material de MAGMA

```bash
npm run media        # public/carro, public/magma, public/og.jpg y src/data/media.ts
npm run assets:logo  # public/marca, favicon-48.png y apple-touch-icon.png
```

- **Carro**: la portada usa `carro4.png` (tres cuartos, 1270×716) y el cierre
  `carro.png` (el faro). También se exportan `carro2` y `carro3`. Son fotos de
  unos 1270 px de ancho, casi 16:9, y van **completas**: sin recortes, sin
  filtros y sin fundidos en los bordes (así lo pidió el cliente), en un marco
  con esquinas redondeadas y borde fino. Se precarga desde `index.html` y
  mientras llega se ve una vista previa difuminada de unos 250 bytes.
- **Compartir el enlace**: `og.jpg` (1200×630) es la misma foto del carro
  recortada a ese formato. WhatsApp y Facebook no muestran SVG ni rutas
  relativas; el `og.svg` anterior llevaba una moto dibujada y «19 modelos».
- **Iconos**: el monograma H&D del logo oficial sobre el fondo de la web.
  Sustituyen al `favicon.svg` del principio, un hexágono con «HD» que no era el
  logo.
- **MAGMA**: `banner.png`, `info.png`–`info5.png`, `magma.png`–`magma4.png` y
  `magamrespuesot.png` (el amortiguador), a 380 px y a su ancho original
  (hasta 760).
- **Carro azul claro**: cuatro de las cinco fotos `.jpg.jpeg` de la raíz, en
  `public/carro-mini` (`CARRO_MINI`), para la sección de carros eléctricos. No
  hay nombre ni datos: se presenta por el color y las puertas.

El vídeo del local se comprime aparte con `npm run assets:video`.

---

## Repuestos

```bash
npm run repuestos                  # parts:excel → parts:photos → parts:clean → parts
npm run audit:parts -- --sinfoto   # resumen y las que no tienen foto
```

**135 repuestos** del Excel `Repuestos_Bicyrekkord.xlsx`, con nombre,
categoría, precio y descripción tal como vienen del proveedor. 134 tienen
referencia; «Batería Plomo Gel 12V 27AH» no la trae.

Las fotos se sacan primero del PDF de Bicyrekkord (`parts:photos`). El catálogo
abre cada producto con una ficha y pone las fotos en las páginas siguientes, así
que el extractor arrastra el producto activo hasta la ficha siguiente.

Después, `parts:clean` las cambia por las de **«Repuestos sin marca de agua»**,
que son fotos equivalentes de otros vendedores. Se revisaron todas contra la
original, primero lado a lado y después todas juntas en una hoja: **107 se
usan y 27 no**. Las 27 enseñan otra pieza (una farola en lugar del altavoz,
otros conectores, otros cargadores), otra marca en la etiqueta de las baterías,
el logotipo o la marca de agua de otra tienda, o la pieza cortada.

Esas 27 quedan **sin foto** (la tarjeta muestra el icono de su categoría): el
cliente pidió que no quedara ninguna con marca de agua, y la única otra foto era
la del PDF, con la de Bicyrekkord. El motivo de cada una está en `NO_USAR`
(`scripts/build-parts-clean.mjs`) y el resultado en
`scripts/data/repuestos-fotos-limpias.json`. Referencias: RKAC019, RKAC013,
RKAC033, RKAB001, RKBTS009, «Batería Plomo Gel 12V 27AH», RKBB014, RKBR003,
RKCM009, RKCM015, RKCM016, RKCM017, RKCM008, RKCG010, RKCG001, RKCM006, RKCM007,
RKCZ020, RKEM001, RKAC008-1, RKPE001, RKRC001, RKRD005, RKSH004, RKSS001, RKSW002
y RKSW005.

Para quitar o añadir una excepción hay que volver a sacar las originales:
`npm run repuestos` completo, no solo `parts:clean`.

**107 de 135 tienen foto.** Además de esas 27, «Motor 500W-48V/60V, Rin 10´»
(RKMT021) no tiene en ninguna fuente.

---

## SEO

- Título, descripción, `canonical`, Open Graph con `og.jpg`, `robots.txt` y
  `sitemap.xml`, todos con `https://hydmotos.vercel.app`. La dirección anterior
  (`hdmotorens.com`) no existía.
- La descripción ya no dice que todas las motos llevan batería de grafeno:
  muchas del Excel son de plomo o de litio.
- Datos estructurados (`StructuredData.tsx`): el concesionario, las 80 motos y
  los 135 repuestos, generados desde el catálogo. Solo llevan oferta los que
  tienen precio. No se declara marca (ninguno es de marca H&D) ni
  disponibilidad (no está confirmada).

---

## Estructura

```
scripts/
├── pick-photos.mjs · build-photos.mjs · build-extra-photos.mjs · build-catalog.mjs
├── build-media.mjs · build-logo.mjs
├── parse-parts-xlsx.mjs · extract-parts-photos.mjs · build-parts-clean.mjs · build-parts.mjs
└── cutout.mjs · encuadre.mjs · sku.mjs      ← piezas compartidas
src/
├── data/
│   ├── motos.ts        ← GENERADO: 80 modelos
│   ├── repuestos.ts    ← GENERADO: 135 repuestos
│   ├── media.ts        ← GENERADO: fotos de los carros y material de MAGMA
│   ├── promos.ts       ← videos del banner de descuentos
│   └── site.ts         ← WhatsApp, contacto, redes, menú por categorías
├── lib/                ← wa.ts (WhatsApp) · catalogo.ts (filtrar desde fuera) · img.ts
├── hooks/              ← useReveal, useTilt
└── components/
    ├── art/            ← Logo, Icons, PhotoPending
    ├── ui/Primitives.tsx
    ├── LoadingScreen · Navbar · Hero · Marquee · Descuentos
    ├── Featured · Catalog · MotoCard · MotoModal · Magma
    ├── Patinetas · Carros · Taller · Parts · PartModal · Benefits
    └── Showroom · CTA · Contact · Footer · WhatsAppButton · StructuredData
```

### Colores (`tailwind.config.js`)

| Token | Valor | Uso |
|---|---|---|
| `void` / `graphite` | `#0B0D11` / `#12151B` | fondos oscuros |
| `paper` / `paper2` / `card` | `#F1F4F8` / `#E4E9F0` / `#FFFFFF` | fondos claros y tarjetas |
| `chrome` / `silver` | `#E6ECF4` / `#AEB6C2` | texto sobre oscuro |
| `ink` / `slate` | `#080C13` / `#4A5768` | texto sobre claro |
| `blue` / `blue-deep` / `blue-soft` | `#1B57D6` / `#123C99` / `#4C7CFF` | acentos del logo; `blue-soft` es el anillo de foco |
| `red` / `red-btn` | `#D62030` / `#C0121F` | acentos y botón principal |
| `cyan` | `#3D8BFF` | azul eléctrico: etiquetas, líneas y bordes sobre oscuro |

---

## Verificado (15/09)

- **Datos:** los 19 modelos del cliente conservan precio y oferta exactos, y
  la ficha de ninguno contradice ya su tarjeta. Revisadas a ojo las fotos de los
  80 modelos: ninguna repetida ni de otro vehículo.
- **Responsive:** 320, 360, 390, 430, 768, 1024, 1280, 1440 y 1920 px sin
  scroll horizontal ni imágenes rotas, con un solo `h1`. Los botones caben en
  una línea desde 320 px.
- **Portátil de 1366×628:** la portada cabe entera y los dos botones van en una
  fila.
- **Interacciones:** accesos por tipo y botones de MAGMA filtran el catálogo;
  búsqueda, filtros, orden, «Ver más», ficha con `Esc`, foco atrapado en las
  fichas y devuelto al cerrar, repuestos por categoría y referencia, menú de
  escritorio y menú móvil (también con `Esc`). Los enlaces del menú dejan cada
  sección justo bajo la barra (antes quedaba 96 px más abajo: se sumaban
  `scroll-padding` y `scroll-mt`).
- **Accesibilidad:** axe-core sin infracciones. Anillo de foco visible en
  fondos claros y oscuros. Con «reducir movimiento» no hay pantalla de carga ni
  animaciones, y la portada aparece sin esperas.
- **Build:** TypeScript sin errores (`npx tsc -b`) y consola limpia.

## Notas

- **No se dibuja ninguna moto por código.** `MotoArt.tsx` sigue en el repo
  porque de él sale el tipo `MotoVariant` del catálogo, pero no se renderiza y
  no pesa en el paquete (`import type`).
- La pantalla de carga dura entre 0,65 y 1,3 s como máximo y no aparece con
  «reducir movimiento».
- `npm run build` compila con `tsc -b --noCheck`: para comprobar tipos, `npx tsc -b`.
