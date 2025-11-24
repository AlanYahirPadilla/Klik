import { createClient } from "@/lib/supabase/server"
import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-4xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
        <h1 className="mb-8 text-4xl font-bold">Política de Privacidad</h1>
        <p className="mb-6 text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">1. Información que Recopilamos</h2>
            <p className="mb-4 text-muted-foreground">
              Recopilamos información que nos proporcionas directamente, incluyendo:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Información de registro (nombre, email, nombre de usuario)</li>
              <li>Contenido que publicas (posts, comentarios, imágenes)</li>
              <li>Información de perfil (foto de perfil, biografía, ubicación)</li>
              <li>Mensajes directos que envías y recibes</li>
              <li>Información de uso y actividad en la plataforma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">2. Cómo Usamos tu Información</h2>
            <p className="mb-4 text-muted-foreground">Utilizamos la información recopilada para:</p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Personalizar tu experiencia en la plataforma</li>
              <li>Enviarte notificaciones sobre actividad relevante</li>
              <li>Detectar y prevenir fraudes y abusos</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">3. Compartir Información</h2>
            <p className="mb-4 text-muted-foreground">
              No vendemos tu información personal. Podemos compartir información en las siguientes circunstancias:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Con tu consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Para proteger nuestros derechos y seguridad</li>
              <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">4. Seguridad de los Datos</h2>
            <p className="mb-4 text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra
              acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">5. Tus Derechos</h2>
            <p className="mb-4 text-muted-foreground">Tienes derecho a:</p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Oponerte al procesamiento de tu información</li>
              <li>Solicitar la portabilidad de tus datos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">6. Cookies y Tecnologías Similares</h2>
            <p className="mb-4 text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Para más información, consulta
              nuestra Política de Cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">7. Retención de Datos</h2>
            <p className="mb-4 text-muted-foreground">
              Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos
              en esta política, a menos que la ley requiera o permita un período de retención más largo.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">8. Cambios a esta Política</h2>
            <p className="mb-4 text-muted-foreground">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre cambios significativos
              publicando la nueva política en esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">9. Contacto</h2>
            <p className="mb-4 text-muted-foreground">
              Si tienes preguntas sobre esta Política de Privacidad, puedes contactarnos a través de nuestra página de
              contacto.
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

