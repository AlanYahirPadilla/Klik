import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import Link from "next/link"
import { HelpCircle, MessageSquare, Book, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function SupportPage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-4xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Centro de Ayuda</h1>
          <p className="text-muted-foreground">Encuentra respuestas a tus preguntas más frecuentes</p>
        </div>

        <div className="mb-12 grid gap-4 md:grid-cols-2">
          <Link href="/faq" className="group rounded-lg border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
            <Book className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Preguntas Frecuentes</h3>
            <p className="text-sm text-muted-foreground">Respuestas a las preguntas más comunes sobre Klik</p>
          </Link>

          <Link href="/contact" className="group rounded-lg border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
            <MessageSquare className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-2 text-xl font-semibold">Contactar Soporte</h3>
            <p className="text-sm text-muted-foreground">Envía un mensaje a nuestro equipo de soporte</p>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-semibold">Temas Populares</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="mb-2 font-semibold">¿Cómo crear una cuenta?</h3>
              <p className="text-sm text-muted-foreground">
                Ve a la página de registro, completa el formulario con tu información y verifica tu email.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="mb-2 font-semibold">¿Cómo cambiar mi contraseña?</h3>
              <p className="text-sm text-muted-foreground">
                Ve a Configuración → Seguridad y sigue las instrucciones para cambiar tu contraseña.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="mb-2 font-semibold">¿Cómo reportar contenido inapropiado?</h3>
              <p className="text-sm text-muted-foreground">
                Usa el menú de opciones (⋯) en cualquier post o comentario y selecciona "Reportar".
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <h3 className="mb-2 font-semibold">¿Cómo eliminar mi cuenta?</h3>
              <p className="text-sm text-muted-foreground">
                Ve a Configuración → Privacidad y selecciona "Eliminar cuenta". Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
          <Mail className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h3 className="mb-2 text-xl font-semibold">¿No encuentras lo que buscas?</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Nuestro equipo de soporte está listo para ayudarte
          </p>
          <Button asChild>
            <Link href="/contact">Contactar Soporte</Link>
          </Button>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

