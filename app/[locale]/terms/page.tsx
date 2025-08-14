import SimplePageLayout from "@/components/simple-page-layout"

export default function TermsAndConditionsPage() {
  const lastUpdated = "15 de junio de 2025"

  return (
    <SimplePageLayout title="Términos y Condiciones">
      <p className="text-sm text-gray-400">Última actualización: {lastUpdated}</p>

      <h2>1. Aceptación de los Términos</h2>
      <p>
        Al acceder y utilizar el sitio web de Atelier Belli (el "Sitio") y cualquiera de sus aplicaciones móviles o
        servicios (colectivamente, los "Servicios"), usted acepta y se compromete a cumplir con estos Términos y
        Condiciones ("Términos"). Si no está de acuerdo con estos Términos, no debe acceder ni utilizar nuestros
        Servicios.
      </p>

      <h2>2. Derechos de Propiedad Intelectual</h2>
      <p>
        A menos que se indique lo contrario, el Sitio y todos los materiales de origen, incluyendo código fuente, bases
        de datos, funcionalidad, software, diseños de sitios web, audio, video, texto, fotografías y gráficos
        (colectivamente, el "Contenido") y las marcas comerciales, marcas de servicio y logotipos contenidos en él (las
        "Marcas") son de nuestra propiedad o están bajo nuestro control o licencia, y están protegidos por las leyes de
        derechos de autor y marcas registradas. El Contenido y las Marcas se proporcionan en el Sitio "TAL CUAL" para su
        información y uso personal únicamente.
      </p>

      <h2>3. Representaciones del Usuario</h2>
      <p>Al utilizar los Servicios, usted representa y garantiza que:</p>
      <ul>
        <li>Toda la información de registro que envíe será verdadera, precisa, actual y completa.</li>
        <li>Mantendrá la exactitud de dicha información y la actualizará rápidamente según sea necesario.</li>
        <li>Tiene la capacidad legal y acepta cumplir con estos Términos.</li>
        <li>No utilizará los Servicios para ningún propósito ilegal o no autorizado.</li>
        <li>Su uso de los Servicios no violará ninguna ley o regulación aplicable.</li>
      </ul>

      <h2>4. Actividades Prohibidas</h2>
      <p>
        No puede acceder ni utilizar el Sitio para ningún otro propósito que no sea aquel para el que ponemos el Sitio a
        disposición. El Sitio no puede ser utilizado en conexión con ningún esfuerzo comercial excepto aquellos que sean
        específicamente respaldados o aprobados por nosotros.
      </p>

      <h2>5. Terminación</h2>
      <p>
        Nos reservamos el derecho, a nuestra entera discreción, de denegar el acceso y uso de los Servicios (incluyendo
        el bloqueo de ciertas direcciones IP) a cualquier persona por cualquier motivo o sin motivo alguno, incluyendo,
        sin limitación, el incumplimiento de cualquier representación, garantía o pacto contenido en estos Términos o de
        cualquier ley o regulación aplicable. Podemos terminar su uso o participación en los Servicios o eliminar
        cualquier contenido o información que haya publicado en cualquier momento, sin previo aviso, a nuestra entera
        discreción.
      </p>

      <h2>6. Ley Aplicable</h2>
      <p>
        Estos Términos se regirán e interpretarán de acuerdo con las leyes de [Tu Jurisdicción, ej. el Estado de..., el
        País de...], sin tener en cuenta sus principios de conflicto de leyes.
      </p>

      <h2>7. Limitación de Responsabilidad</h2>
      <p>
        EN NINGÚN CASO NOSOTROS O NUESTROS DIRECTORES, EMPLEADOS O AGENTES SEREMOS RESPONSABLES ANTE USTED O CUALQUIER
        TERCERO POR CUALQUIER DAÑO DIRECTO, INDIRECTO, CONSECUENTE, EJEMPLAR, INCIDENTAL, ESPECIAL O PUNITIVO,
        INCLUYENDO LA PÉRDIDA DE BENEFICIOS, PÉRDIDA DE INGRESOS, PÉRDIDA DE DATOS U OTROS DAÑOS DERIVADOS DE SU USO DE
        LOS SERVICIOS, INCLUSO SI HEMOS SIDO ADVERTIDOS DE LA POSIBILIDAD DE TALES DAÑOS.
      </p>

      <h2>8. Cambios a los Términos</h2>
      <p>
        Nos reservamos el derecho de cambiar, modificar o revisar estos Términos en cualquier momento y por cualquier
        motivo a nuestra entera discreción. Cualquier cambio o modificación será efectivo inmediatamente después de la
        publicación de los Términos actualizados en el Sitio, y usted renuncia a cualquier derecho a recibir un aviso
        específico de cada uno de dichos cambios o modificaciones.
      </p>

      <h2>9. Contacto</h2>
      <p>
        Para resolver una queja sobre los Servicios o para recibir más información sobre el uso de los Servicios, por
        favor contáctenos en:
        <br />
        Atelier Belli
        <br />
        <a href="mailto:contacto@atelierbelli.com">contacto@atelierbelli.com</a>
        <br />
        [Tu Dirección Física, si aplica]
      </p>
    </SimplePageLayout>
  )
}
