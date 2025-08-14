import SimplePageLayout from "@/components/simple-page-layout"
import { MailIcon, HelpCircleIcon, ClockIcon } from "lucide-react"

export default function FingoSupportPage() {
  return (
    <SimplePageLayout title="Soporte para Fingo">
      <p className="lead">
        ¡Gracias por usar Fingo! Estamos aquí para ayudarte con cualquier pregunta o problema que puedas tener.
      </p>

      <h2>Contacta con Nosotros</h2>
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center text-lg font-semibold mb-1">
            <MailIcon className="w-5 h-5 mr-2 text-pink-400" />
            Soporte por Email
          </h3>
          <p>
            Para consultas generales, problemas técnicos o feedback, por favor envíanos un correo electrónico a:
            <br />
            <a href="mailto:support.fingo@atelierbelli.com" className="font-medium">
              support.fingo@atelierbelli.com
            </a>
          </p>
          <p className="text-sm text-gray-400">
            Intentamos responder a todos los correos electrónicos dentro de las 24-48 horas hábiles.
          </p>
        </div>

        <div>
          <h3 className="flex items-center text-lg font-semibold mb-1">
            <HelpCircleIcon className="w-5 h-5 mr-2 text-pink-400" />
            Preguntas Frecuentes (FAQ)
          </h3>
          <p>
            Muchas respuestas a preguntas comunes se pueden encontrar en nuestra sección de FAQ.
            <br />
            <a href="/fingo/faq" className="font-medium">
              {" "}
              {/* Placeholder para tu página de FAQ */}
              Visita nuestras FAQ
            </a>
          </p>
        </div>
      </div>

      <h2 className="mt-8">Horario de Atención</h2>
      <div className="flex items-center">
        <ClockIcon className="w-5 h-5 mr-2 text-pink-400" />
        <p>Nuestro equipo de soporte está disponible de Lunes a Viernes, de 9:00 AM a 5:00 PM (Tu Zona Horaria).</p>
      </div>

      <h2 className="mt-8">Información Adicional</h2>
      <p>
        Para asegurar que podamos ayudarte de la manera más eficiente posible, por favor incluye la siguiente
        información cuando nos contactes (si aplica):
      </p>
      <ul>
        <li>Versión de la app Fingo que estás utilizando.</li>
        <li>Modelo de tu dispositivo y versión del sistema operativo.</li>
        <li>Una descripción detallada del problema o pregunta.</li>
        <li>Pasos para reproducir el problema (si es un error).</li>
        <li>Capturas de pantalla o videos del problema (si es posible).</li>
      </ul>
      <p>¡Agradecemos tu paciencia y cooperación!</p>
    </SimplePageLayout>
  )
}
