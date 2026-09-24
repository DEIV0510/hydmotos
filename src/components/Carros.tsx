import FichaVehiculo from '@/components/FichaVehiculo'
import { Button, Reveal, SectionHead } from '@/components/ui/Primitives'
import { useVehiculosVivo } from '@/lib/vehiculos-live'
import { useWa } from '@/lib/wa'

const WA_CARROS = 'Hola, quiero información sobre los carros eléctricos de H&D MOTORENS. ¿Cuáles tienen disponibles?'

/**
 * Carros eléctricos. El cliente los pidió como categoría (notas de voz del 11
 * y el 15/09) y después pidió poder administrarlos (23/09): ahora salen de
 * /admin/carros. Los dos de siempre (plateado y azul claro) quedaron en la
 * base de datos con sus fotos, sin nombre comercial ni precio porque no los
 * ha dado: el precio va por WhatsApp hasta que lo pongan en el panel.
 *
 * Las fotos van completas, sin recorte ni fundidos, como pidió el cliente.
 */
export default function Carros() {
  const { carros } = useVehiculosVivo()
  const { waLink, waReady } = useWa()

  // Sin carros publicados la sección sigue ahí (el menú enlaza a #carros),
  // pero no inventa ninguno: invita a preguntar.
  return (
    <section id="carros" className="relative bg-void py-16 sm:py-24">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <SectionHead
          eyebrow="05 · Carros eléctricos"
          title={
            <>
              Carros
              <br />
              eléctricos
            </>
          }
          sub={
            carros.length
              ? 'Mira cada carro en todas sus fotos y pregunta por el precio y la disponibilidad por WhatsApp.'
              : 'Escríbenos y te contamos qué carros eléctricos hay disponibles.'
          }
        />
        {carros.length > 0 ? (
          <ul className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-6">
            {carros.map((v, i) => (
              <Reveal as="li" key={v.id} delay={i * 90} className="h-full">
                <FichaVehiculo v={v} tono="oscuro" />
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal delay={160}>
            <div className="mt-8">
              <Button href={waLink(WA_CARROS)} external={waReady}>
                Consultar por WhatsApp
              </Button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
