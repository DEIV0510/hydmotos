import { useId } from 'react'

export type MotoVariant = 'street' | 'sport' | 'trail' | 'scooter' | 'trike'

type Props = {
  variant?: MotoVariant
  className?: string
  /** Grosor del trazo principal, en unidades del viewBox (900x520) */
  weight?: number
  /** Si se pasa, el SVG se anuncia a lectores de pantalla con este texto */
  title?: string
}

/**
 * Ilustración vectorial de moto eléctrica, dibujada a medida para H&D MOTORENS.
 * Perfil derecho, viewBox 900x520, línea de suelo en y=476.
 *
 * Todas las variantes comparten el mismo lenguaje gráfico (trazo, gradiente,
 * bujes) pero tienen carrocería propia para que las categorías del catálogo
 * se distingan de un vistazo. Al ser eléctricas no llevan escape: el bloque
 * central es la batería.
 */
export default function MotoArt({ variant = 'street', className = '', weight = 6, title }: Props) {
  const uid = useId().replace(/:/g, '')
  const ln = `ln-${uid}`
  const fl = `fl-${uid}`
  const P = PARTS[variant]

  return (
    <svg
      viewBox="0 0 900 520"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={ln} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7DF0FF" />
          <stop offset=".5" stopColor="#2E7BFF" />
          <stop offset="1" stopColor="#1140C8" />
        </linearGradient>
        <linearGradient id={fl} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2E7BFF" stopOpacity=".36" />
          <stop offset="1" stopColor="#0B2A7A" stopOpacity=".05" />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke={`url(#${ln})`}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Chasis, por detrás de la carrocería */}
        <g strokeWidth={weight * 1.15} opacity=".5">
          {P.frame.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {P.wheels.map((w, i) => (
          <Wheel key={i} w={w} fill={fl} weight={weight} />
        ))}

        {P.swing.map((d, i) => (
          <path key={i} d={d} fill={`url(#${fl})`} />
        ))}
        {P.shock.map((d, i) => (
          <path key={i} d={d} strokeWidth={weight * 1.8} />
        ))}

        {/* Batería + motor eléctrico */}
        {P.pack.map((d, i) => (
          <path key={i} d={d} fill={`url(#${fl})`} />
        ))}
        {P.bolt && (
          <path d={P.bolt} strokeWidth={weight * 0.7} fill={`url(#${fl})`} opacity=".95" />
        )}

        {/* Carrocería: tanque, asiento, carenados */}
        {P.body.map((d, i) => (
          <path key={i} d={d} fill={`url(#${fl})`} />
        ))}

        {/* Tren delantero */}
        {P.forks.map(([d, w], i) => (
          <path key={i} d={d} strokeWidth={weight * w} />
        ))}
        {P.fenders.map((d, i) => (
          <path key={i} d={d} strokeWidth={weight * 1.4} />
        ))}

        {/* Faro */}
        {P.lamp.map((d, i) => (
          <path key={i} d={d} fill={`url(#${fl})`} />
        ))}
        {P.lampCore && (
          <circle {...P.lampCore} strokeWidth={weight * 0.5} opacity=".6" />
        )}
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------------- */

function Wheel({ w, fill, weight }: { w: WheelT; fill: string; weight: number }) {
  const R = w.r * 0.635
  const spokes = [0, 60, 120]
    .map((deg) => {
      const a = (deg * Math.PI) / 180
      const dx = Math.cos(a) * R
      const dy = Math.sin(a) * R
      return `M${(w.cx - dx).toFixed(1)} ${(w.cy - dy).toFixed(1)} L${(w.cx + dx).toFixed(1)} ${(w.cy + dy).toFixed(1)}`
    })
    .join(' ')

  return (
    <g>
      <circle cx={w.cx} cy={w.cy} r={w.r} />
      <circle cx={w.cx} cy={w.cy} r={R} strokeWidth={weight * 0.58} opacity=".9" />
      <circle cx={w.cx} cy={w.cy} r={w.r * 0.4} strokeWidth={weight * 0.42} opacity=".5" />
      <path d={spokes} strokeWidth={weight * 0.58} opacity=".85" />
      <circle cx={w.cx} cy={w.cy} r={weight * 1.4} fill={`url(#${fill})`} strokeWidth={weight * 0.6} />
    </g>
  )
}

type WheelT = { cx: number; cy: number; r: number }
type Part = {
  wheels: WheelT[]
  frame: string[]
  swing: string[]
  shock: string[]
  /** Bloque de batería / motor eléctrico */
  pack: string[]
  /** Rayo de la batería */
  bolt?: string
  body: string[]
  forks: [string, number][]
  fenders: string[]
  lamp: string[]
  lampCore?: { cx: number; cy: number; r: number }
}

/* ================================================================ */
/*  GEOMETRÍA POR VARIANTE                                          */
/* ================================================================ */

const PARTS: Record<MotoVariant, Part> = {
  /* ---------- URBANA / NAKED ELÉCTRICA ---------- */
  street: {
    wheels: [
      { cx: 200, cy: 372, r: 104 },
      { cx: 700, cy: 372, r: 104 },
    ],
    frame: ['M610 262 L402 338', 'M602 276 L494 332', 'M400 296 L262 250', 'M612 236 L624 270'],
    swing: ['M386 334 L400 360 L208 384 L200 356 Z'],
    shock: ['M376 300 L330 352'],
    pack: [
      // batería vertical bajo el tanque
      'M406 292 L500 306 L490 388 L396 372 Z',
      // motor de rueda
      'M370 356 L400 350 L406 384 L376 390 Z',
    ],
    bolt: 'M452 318 L436 344 L456 348 L442 372',
    body: [
      'M604 260 C 588 236, 548 224, 502 226 C 458 228, 424 242, 408 264 L 406 292 C 440 306, 494 308, 536 300 C 578 292, 604 278, 604 260 Z',
      'M408 264 L 350 250 C 322 244, 292 234, 268 224 C 256 219, 244 226, 244 238 C 244 250, 256 258, 272 264 C 310 278, 356 286, 406 292 Z',
    ],
    forks: [
      ['M622 236 L692 356', 2],
      ['M648 228 L716 348', 1.5],
      ['M610 234 L654 220', 1.3],
      ['M636 222 L588 200', 1.5],
    ],
    fenders: ['M592 336 A118 118 0 0 1 716 262', 'M142 272 A116 116 0 0 1 275 283'],
    lamp: ['M678 224 m-27 0 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0'],
    lampCore: { cx: 678, cy: 224, r: 12 },
  },

  /* ---------- ALTA POTENCIA / CARENADA ---------- */
  sport: {
    wheels: [
      { cx: 206, cy: 380, r: 100 },
      { cx: 700, cy: 380, r: 100 },
    ],
    frame: ['M604 268 L400 340', 'M596 286 L494 336', 'M398 300 L280 256'],
    swing: ['M390 340 L404 366 L214 392 L206 364 Z'],
    shock: ['M380 306 L336 358'],
    pack: ['M394 300 L502 316 L492 400 L384 380 Z', 'M376 364 L406 358 L412 392 L382 398 Z'],
    bolt: 'M446 330 L430 356 L450 360 L436 384',
    body: [
      // cúpula + flanco del carenado (deja ver rueda y faro)
      'M566 232 C 596 208, 630 198, 656 206 C 676 214, 686 236, 686 260 L 682 300 C 678 328, 660 346, 634 352 L 570 362 C 542 364, 522 352, 512 330 L 508 300 Z',
      'M566 238 C 546 224, 508 218, 468 222 C 428 226, 400 240, 388 260 L 388 288 C 418 302, 468 304, 506 296 C 538 290, 560 262, 566 238 Z',
      'M388 262 L 336 250 C 308 243, 280 230, 258 216 C 246 208, 232 214, 230 228 C 228 242, 240 252, 256 260 C 292 278, 340 288, 386 292 Z',
    ],
    forks: [
      ['M624 250 L692 364', 2],
      ['M650 242 L716 356', 1.4],
    ],
    fenders: ['M594 344 A114 114 0 0 1 714 272'],
    lamp: ['M660 226 L 692 242 L 688 272 L 656 258 Z'],
  },

  /* ---------- TRAIL / DOBLE PROPÓSITO ---------- */
  trail: {
    wheels: [
      { cx: 196, cy: 366, r: 110 },
      { cx: 704, cy: 366, r: 118 },
    ],
    frame: ['M600 234 L396 318', 'M592 250 L488 314', 'M394 274 L258 224', 'M604 208 L616 244'],
    swing: ['M382 312 L396 340 L204 378 L196 348 Z'],
    shock: ['M374 268 L326 330'],
    pack: ['M394 274 L496 290 L486 372 L384 354 Z', 'M360 336 L392 330 L398 364 L366 370 Z'],
    bolt: 'M444 302 L428 328 L448 332 L434 356',
    body: [
      'M598 234 C 582 204, 540 190, 492 194 C 446 198, 410 214, 394 240 L 392 274 C 428 292, 486 294, 528 284 C 572 274, 598 254, 598 234 Z',
      'M394 240 L 336 224 C 306 216, 276 206, 252 196 C 240 191, 228 198, 228 210 C 228 222, 240 230, 256 236 C 296 254, 344 266, 392 274 Z',
      // pico de rally
      'M600 212 C 622 194, 654 190, 674 202 L 692 216 L 660 232 L 610 236 Z',
    ],
    forks: [
      ['M614 226 L694 342', 2.1],
      ['M642 216 L722 332', 1.5],
      ['M600 218 L650 202', 1.3],
      ['M626 204 L572 178', 1.6],
    ],
    // guardabarros alto, separado de la rueda
    fenders: ['M584 274 A150 150 0 0 1 742 232', 'M132 258 A122 122 0 0 1 272 272'],
    lamp: ['M666 196 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0'],
    lampCore: { cx: 666, cy: 196, r: 11 },
  },

  /* ---------- SCOOTER / FAMILIAR ---------- */
  scooter: {
    wheels: [
      { cx: 256, cy: 414, r: 62 },
      { cx: 676, cy: 414, r: 62 },
    ],
    frame: [],
    swing: [],
    shock: [],
    pack: ['M330 318 L414 332 L406 388 L324 372 Z'],
    bolt: 'M374 344 L360 366 L378 370 L366 390',
    body: [
      // cuerpo trasero + asiento, en una masa redondeada
      'M300 264 C 336 250, 392 246, 432 256 C 460 264, 470 284, 466 308 L 458 344 C 452 376, 424 396, 388 400 L 322 402 C 292 402, 268 386, 262 356 L 258 302 C 256 278, 274 264, 300 264 Z',
      // plataforma baja para los pies: la firma del scooter
      'M462 336 L 568 336 L 572 376 L 458 376 Z',
      // escudo frontal
      'M568 376 L 574 306 C 578 280, 594 266, 616 264 L 638 266 C 656 270, 664 288, 662 308 L 654 380 C 650 400, 634 410, 614 410 L 580 408 C 568 402, 564 390, 568 376 Z',
    ],
    forks: [
      ['M640 306 L678 402', 1.7],
      ['M622 266 L626 214', 1.4],
      ['M596 208 L664 218', 1.5],
    ],
    fenders: ['M601 401 A76 76 0 0 1 714 348'],
    lamp: ['M604 288 L 650 296 L 646 326 L 602 318 Z'],
  },

  /* ---------- TRICIMOTOR ---------- */
  trike: {
    wheels: [
      { cx: 172, cy: 408, r: 68 },
      { cx: 342, cy: 408, r: 68 },
      { cx: 700, cy: 406, r: 72 },
    ],
    frame: ['M596 296 L470 326', 'M172 408 L342 408', 'M170 322 L170 252', 'M400 328 L400 252'],
    swing: ['M470 340 L482 364 L224 388 L216 360 Z'],
    shock: [],
    pack: ['M418 322 L500 336 L492 392 L410 378 Z'],
    bolt: 'M460 346 L446 368 L464 372 L452 392',
    body: [
      // cajón de carga con esquinas achaflanadas
      'M124 328 L 136 246 L 396 246 L 408 328 Z',
      // asiento del conductor
      'M424 296 C 444 268, 484 254, 526 258 C 560 262, 582 278, 588 300 L 582 318 C 546 326, 474 324, 428 314 Z',
      // escudo frontal
      'M590 298 C 614 304, 630 326, 636 356 L 642 396 C 644 416, 634 428, 616 430 L 590 430 L 580 374 L 570 324 Z',
    ],
    forks: [
      ['M638 326 L700 396', 1.7],
      ['M598 240 L664 250', 1.5],
      ['M614 250 L620 292', 1.3],
    ],
    fenders: ['M628 386 A84 84 0 0 1 736 340'],
    lamp: ['M590 308 L 626 320, L 632 350 L 594 338 Z'],
  },
}
