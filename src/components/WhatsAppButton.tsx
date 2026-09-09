import { useEffect, useState } from 'react'
import { IconWhatsApp } from '@/components/art/Icons'
import { waLink, WA_GENERAL } from '@/lib/wa'

/**
 * Botón flotante de WhatsApp.
 * Aparece tras salir del hero para no competir con los CTA principales.
 */
export default function WhatsAppButton() {
  const [show, setShow] = useState(false)
  const wa = waLink(WA_GENERAL)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      href={wa}
      target={wa.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp a H&D MOTORENS"
      className={`group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-void shadow-[0_12px_36px_-8px_rgba(37,211,102,0.7)] transition-all duration-500 hover:scale-105 active:scale-95 sm:h-16 sm:w-16 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span
        className="absolute inset-0 animate-pulse-glow rounded-full bg-[#25D366]/45 blur-md"
        aria-hidden="true"
      />
      <IconWhatsApp className="relative h-7 w-7 sm:h-8 sm:w-8" />

      {/* Etiqueta en escritorio */}
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full border border-white/10 bg-void/90 px-4 py-2 text-[12px] font-semibold text-chrome opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 lg:block">
        Cotiza por WhatsApp
      </span>
    </a>
  )
}
