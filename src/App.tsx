import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Featured from '@/components/Featured'
import Catalog from '@/components/Catalog'
import Magma from '@/components/Magma'
import Benefits from '@/components/Benefits'
import Parts from '@/components/Parts'
import Showroom from '@/components/Showroom'
import CTA from '@/components/CTA'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import StructuredData from '@/components/StructuredData'

/**
 * Orden de la página, pensado como un recorrido de venta:
 * portada con el carro → destacados y accesos por tipo → catálogo completo →
 * la marca MAGMA → por qué H&D y cómo comprar → repuestos → el local → cierre
 * y contacto. Alterna bloques oscuros y claros para marcar el ritmo.
 */
export default function App() {
  return (
    <>
      <StructuredData />
      <LoadingScreen />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Featured />
        <Catalog />
        <Magma />
        <Benefits />
        <Parts />
        <Showroom />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
