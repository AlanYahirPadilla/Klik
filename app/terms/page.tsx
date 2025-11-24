import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function TermsPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-4xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
        <h1 className="mb-8 text-4xl font-bold">Términos y Condiciones de Uso</h1>
        <p className="mb-6 text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">1. Aceptación de los Términos</h2>
            <p className="mb-4 text-muted-foreground">
              Al acceder y utilizar Klik, aceptas cumplir con estos Términos y Condiciones de Uso. Si no estás de acuerdo
              con alguna parte de estos términos, no debes utilizar nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">2. Descripción del Servicio</h2>
            <p className="mb-4 text-muted-foreground">
              Klik es una plataforma de red social que permite a los usuarios conectarse, compartir contenido, interactuar
              con otros usuarios y comunicarse a través de mensajes directos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">3. Cuenta de Usuario</h2>
            <p className="mb-4 text-muted-foreground">
              Para utilizar ciertas funciones de Klik, debes crear una cuenta. Eres responsable de:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>Proporcionar información precisa y actualizada</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
              <li>Ser responsable de todas las actividades que ocurran bajo tu cuenta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">4. Contenido del Usuario</h2>
            <p className="mb-4 text-muted-foreground">
              Al publicar contenido en Klik, otorgas a Klik una licencia mundial, no exclusiva, libre de regalías para usar,
              reproducir, modificar y distribuir dicho contenido en relación con el servicio.
            </p>
            <p className="mb-4 text-muted-foreground">
              No debes publicar contenido que:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Sea ilegal, difamatorio, acosador o abusivo</li>
              <li>Viole derechos de propiedad intelectual de terceros</li>
              <li>Contenga material pornográfico, violento o inapropiado</li>
              <li>Promueva actividades ilegales</li>
              <li>Contenga spam o publicidad no autorizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">5. Propiedad Intelectual</h2>
            <p className="mb-4 text-muted-foreground">
              Todo el contenido de Klik, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes y software,
              es propiedad de Klik o sus proveedores de contenido y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">6. Privacidad</h2>
            <p className="mb-4 text-muted-foreground">
              Tu privacidad es importante para nosotros. Por favor, revisa nuestra Política de Privacidad para entender
              cómo recopilamos, usamos y protegemos tu información personal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">7. Terminación</h2>
            <p className="mb-4 text-muted-foreground">
              Nos reservamos el derecho de suspender o terminar tu cuenta y acceso al servicio en cualquier momento, sin
              previo aviso, por cualquier motivo, incluyendo pero no limitado a la violación de estos Términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">8. Limitación de Responsabilidad</h2>
            <p className="mb-4 text-muted-foreground">
              Klik se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables de ningún daño directo,
              indirecto, incidental o consecuente que resulte del uso o la imposibilidad de usar nuestro servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">9. Modificaciones</h2>
            <p className="mb-4 text-muted-foreground">
              Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en
              vigor inmediatamente después de su publicación. Es tu responsabilidad revisar estos Términos periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">10. Contacto</h2>
            <p className="mb-4 text-muted-foreground">
              Si tienes preguntas sobre estos Términos, puedes contactarnos a través de nuestra página de contacto o
              enviando un correo electrónico a nuestro equipo de soporte.
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

