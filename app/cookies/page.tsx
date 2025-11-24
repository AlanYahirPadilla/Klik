import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function CookiesPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-4xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
        <h1 className="mb-8 text-4xl font-bold">Política de Cookies</h1>
        <p className="mb-6 text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">1. ¿Qué son las Cookies?</h2>
            <p className="mb-4 text-muted-foreground">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.
              Nos ayudan a recordar tus preferencias y mejorar tu experiencia de navegación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="mb-6">
              <h3 className="mb-2 text-xl font-semibold">Cookies Esenciales</h3>
              <p className="mb-2 text-muted-foreground">
                Estas cookies son necesarias para el funcionamiento básico del sitio y no se pueden desactivar.
              </p>
              <ul className="ml-6 list-disc text-muted-foreground">
                <li>Autenticación de usuarios</li>
                <li>Seguridad de la sesión</li>
                <li>Preferencias de idioma</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-xl font-semibold">Cookies de Funcionalidad</h3>
              <p className="mb-2 text-muted-foreground">
                Estas cookies permiten que el sitio web recuerde tus preferencias y elecciones.
              </p>
              <ul className="ml-6 list-disc text-muted-foreground">
                <li>Preferencias de tema (claro/oscuro)</li>
                <li>Configuraciones de notificaciones</li>
                <li>Preferencias de visualización</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="mb-2 text-xl font-semibold">Cookies Analíticas</h3>
              <p className="mb-2 text-muted-foreground">
                Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
              </p>
              <ul className="ml-6 list-disc text-muted-foreground">
                <li>Análisis de tráfico</li>
                <li>Comportamiento del usuario</li>
                <li>Mejoras del rendimiento</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">3. Gestión de Cookies</h2>
            <p className="mb-4 text-muted-foreground">
              Puedes controlar y gestionar las cookies a través de la configuración de tu navegador. Ten en cuenta que
              desactivar ciertas cookies puede afectar la funcionalidad del sitio.
            </p>
            <p className="mb-4 text-muted-foreground">
              Para gestionar cookies en los navegadores más comunes:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
              <li>Firefox: Opciones → Privacidad y seguridad → Cookies</li>
              <li>Safari: Preferencias → Privacidad → Cookies</li>
              <li>Edge: Configuración → Cookies y permisos de sitio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">4. Cookies de Terceros</h2>
            <p className="mb-4 text-muted-foreground">
              Algunos servicios de terceros que utilizamos pueden establecer sus propias cookies. Estos servicios incluyen:
            </p>
            <ul className="mb-4 ml-6 list-disc text-muted-foreground">
              <li>Servicios de análisis (para entender el uso del sitio)</li>
              <li>Servicios de autenticación (para iniciar sesión)</li>
              <li>Servicios de almacenamiento (para guardar archivos)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">5. Duración de las Cookies</h2>
            <p className="mb-4 text-muted-foreground">
              Las cookies pueden ser de sesión (se eliminan al cerrar el navegador) o persistentes (permanecen hasta
              que expiran o las eliminas manualmente).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">6. Actualizaciones de esta Política</h2>
            <p className="mb-4 text-muted-foreground">
              Podemos actualizar esta Política de Cookies ocasionalmente. Te recomendamos revisar esta página
              periódicamente para estar informado sobre cómo utilizamos las cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">7. Contacto</h2>
            <p className="mb-4 text-muted-foreground">
              Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos a través de nuestra página de
              contacto.
            </p>
          </section>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

