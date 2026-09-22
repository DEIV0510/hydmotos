import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Descuentos from '@/components/Descuentos'
import Featured from '@/components/Featured'
import Catalog from '@/components/Catalog'
import Magma from '@/components/Magma'
import Patinetas from '@/components/Patinetas'
import Carros from '@/components/Carros'
import Taller from '@/components/Taller'
import Parts from '@/components/Parts'
import Benefits from '@/components/Benefits'
import Showroom from '@/components/Showroom'
import CTA from '@/components/CTA'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import StructuredData from '@/components/StructuredData'
import SeoMeta from '@/components/SeoMeta'

/**
 * Orden de la página, pensado como un recorrido de venta y en el mismo orden
 * que el menú por categorías que pidió el cliente:
 * portada → descuentos (el gancho, arriba) → motos (destacados, catálogo y
 * MAGMA) → patinetas → carros eléctricos → taller → repuestos → por qué H&D →
 * el local → cierre y contacto.
 */
export default function App() {
  return (
    <>
      <StructuredData />
      <SeoMeta />
      <LoadingScreen />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Descuentos />
        <Featured />
        <Catalog />
        <Magma />
        <Patinetas />
        <Carros />
        <Taller />
        <Parts />
        <Benefits />
        <Showroom />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
