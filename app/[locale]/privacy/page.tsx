"use client"

import Link from "next/link"
import SimplePageLayout from "@/components/simple-page-layout"
import { usePathname } from "next/navigation"

export default function PrivacyPolicyPage() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const lastUpdated = "14 de junio de 2025"

  return (
    <SimplePageLayout title="Política de Privacidad">
      <p className="text-sm text-gray-400">Última actualización: {lastUpdated}</p>

      <h2>Introducción</h2>
      <p>
        Bienvenido a Atelier Belli. Nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo
        recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web [TuDominio.com]
        o utilizas nuestras aplicaciones móviles (por ejemplo, Fingo). Por favor, lee esta política de privacidad
        cuidadosamente. Si no estás de acuerdo con los términos de esta política de privacidad, por favor no accedas al
        sitio ni a nuestras aplicaciones.
      </p>

      <h2>Información que Recopilamos</h2>
      <p>
        Podemos recopilar información sobre ti de varias maneras. La información que podemos recopilar en el Sitio o a
        través de nuestras Aplicaciones incluye:
      </p>
      <ul>
        <li>
          <strong>Datos Personales:</strong> Información de identificación personal, como tu nombre, dirección de envío,
          dirección de correo electrónico y número de teléfono, e información demográfica, como tu edad, sexo, ciudad
          natal e intereses, que nos proporcionas voluntariamente cuando te registras en el Sitio o nuestras
          Aplicaciones, o cuando eliges participar en diversas actividades relacionadas con el Sitio y nuestras
          Aplicaciones, como chat en línea y tablones de mensajes.
        </li>
        <li>
          <strong>Datos Derivados:</strong> Información que nuestros servidores recopilan automáticamente cuando accedes
          al Sitio o a nuestras Aplicaciones, como tu dirección IP, tu tipo de navegador, tu sistema operativo, tus
          tiempos de acceso y las páginas que has visto directamente antes y después de acceder al Sitio.
        </li>
        <li>
          <strong>Datos Financieros:</strong> Información financiera, como datos relacionados con tu método de pago (por
          ejemplo, número de tarjeta de crédito válida, marca de la tarjeta, fecha de caducidad) que podemos recopilar
          cuando compras, ordenas, devuelves, intercambias o solicitas información sobre nuestros servicios desde el
          Sitio o nuestras Aplicaciones.
        </li>
        <li>
          <strong>Datos de Aplicaciones Móviles:</strong> Si te conectas usando nuestra(s) aplicación(es) móvil(es):
          <ul>
            <li>
              <em>Información del Dispositivo Móvil.</em> Podemos recopilar información del dispositivo (como el ID de
              tu dispositivo móvil, modelo y fabricante), sistema operativo, información de la versión e dirección IP.
            </li>
            <li>
              <em>Datos de Geolocalización.</em> Podemos solicitar acceso o permiso y rastrear información basada en la
              ubicación de tu dispositivo móvil, ya sea continuamente o mientras estás usando nuestra aplicación móvil,
              para proporcionar servicios basados en la ubicación.
            </li>
          </ul>
        </li>
      </ul>

      <h2>Cómo Usamos Tu Información</h2>
      <p>
        Tener información precisa sobre ti nos permite proporcionarte una experiencia fluida, eficiente y personalizada.
        Específicamente, podemos usar la información recopilada sobre ti a través del Sitio o nuestras Aplicaciones
        para:
      </p>
      <ul>
        <li>Crear y gestionar tu cuenta.</li>
        <li>Enviarte por correo electrónico tu cuenta o pedido.</li>
        <li>Permitir la comunicación entre usuarios.</li>
        <li>
          Cumplir y gestionar compras, pedidos, pagos y otras transacciones relacionadas con el Sitio y nuestras
          Aplicaciones.
        </li>
        <li>Mejorar la eficiencia y el funcionamiento del Sitio y nuestras Aplicaciones.</li>
      </ul>

      <h2>Seguridad de Tus Datos</h2>
      <p>
        Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información
        personal. Si bien hemos tomado medidas razonables para asegurar la información personal que nos proporcionas,
        ten en cuenta que a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable.
      </p>

      <h2>Tus Derechos de Privacidad</h2>
      <p>
        Dependiendo de tu ubicación, puedes tener ciertos derechos con respecto a tu información personal. Para más
        información sobre cómo ejercer estos derechos, por favor visita nuestra página de{" "}
        <Link href={`/${locale}/privacy/choices`}>Opciones de Privacidad del Usuario</Link>.
      </p>

      <h2>Política para Niños</h2>
      <p>
        No solicitamos conscientemente información ni comercializamos a niños menores de 13 años. Si te das cuenta de
        cualquier dato que hayamos recopilado de niños menores de 13 años, por favor contáctanos usando la información
        de contacto proporcionada a continuación.
      </p>

      <h2>Cambios a Esta Política de Privacidad</h2>
      <p>
        Podemos actualizar esta Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la
        nueva Política de Privacidad en esta página.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tienes preguntas o comentarios sobre esta Política de Privacidad, por favor contáctanos en:
        <br />
        Atelier Belli
        <br />
        [Tu Dirección de Correo Electrónico de Contacto para Privacidad]
        <br />
        [Tu Dirección Física, si aplica]
      </p>
    </SimplePageLayout>
  )
}
