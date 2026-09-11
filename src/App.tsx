import LoadingScreen from '@/components/LoadingScreen'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Marquee from '@/components/Marquee'
import Catalog from '@/components/Catalog'
import Highlights from '@/components/Highlights'
import Benefits from '@/components/Benefits'
import Process from '@/components/Process'
import Services from '@/components/Services'
import Parts from '@/components/Parts'
import Showroom from '@/components/Showroom'
import CTA from '@/components/CTA'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import StructuredData from '@/components/StructuredData'

export default function App() {
  return (
    <>
      <StructuredData />
      <LoadingScreen />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Catalog />
        <Highlights />
        <Benefits />
        <Process />
        <Services />
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
