import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function FAQPage() {
  const faqs = [
    {
      question: "¿Cómo creo una cuenta en Klik?",
      answer: "Para crear una cuenta, ve a la página de registro, completa el formulario con tu nombre, email y contraseña, y luego verifica tu email haciendo clic en el enlace que recibirás.",
    },
    {
      question: "¿Puedo cambiar mi nombre de usuario?",
      answer: "Sí, puedes cambiar tu nombre de usuario desde la página de configuración de tu perfil. Ten en cuenta que el nombre de usuario debe ser único.",
    },
    {
      question: "¿Cómo cambio mi foto de perfil?",
      answer: "Ve a tu perfil y haz clic en tu foto de perfil actual. Se abrirá un editor que te permitirá subir una nueva imagen y recortarla según tus preferencias.",
    },
    {
      question: "¿Cómo sigo a otros usuarios?",
      answer: "Puedes seguir a otros usuarios visitando su perfil y haciendo clic en el botón 'Seguir'. También puedes buscar usuarios desde la página de búsqueda.",
    },
    {
      question: "¿Cómo creo un post?",
      answer: "En la página principal (feed), verás un cuadro de texto en la parte superior. Escribe tu mensaje, opcionalmente agrega una imagen, y haz clic en 'Publicar'.",
    },
    {
      question: "¿Puedo editar o eliminar mis posts?",
      answer: "Sí, puedes editar o eliminar tus posts. Haz clic en el menú de opciones (⋯) en tu post y selecciona 'Editar' o 'Eliminar' según lo que necesites.",
    },
    {
      question: "¿Cómo envío un mensaje directo?",
      answer: "Ve a la página de mensajes, haz clic en 'Nuevo mensaje' y busca al usuario con quien quieres chatear. También puedes iniciar una conversación desde el perfil de un usuario.",
    },
    {
      question: "¿Cómo cambio la configuración de privacidad?",
      answer: "Ve a Configuración → Privacidad para ajustar quién puede ver tu perfil, enviarte mensajes y ver tus posts.",
    },
    {
      question: "¿Qué son las listas de usuarios?",
      answer: "Las listas te permiten organizar a los usuarios que sigues en grupos personalizados. Puedes crear listas como 'Amigos', 'Famosos', etc., y filtrar tu feed por lista.",
    },
    {
      question: "¿Cómo reporto contenido inapropiado?",
      answer: "Usa el menú de opciones (⋯) en cualquier post o comentario y selecciona 'Reportar'. Nuestro equipo revisará el reporte y tomará las medidas necesarias.",
    },
    {
      question: "¿Puedo eliminar mi cuenta?",
      answer: "Sí, puedes eliminar tu cuenta desde Configuración → Privacidad. Ten en cuenta que esta acción es permanente y eliminará todos tus datos.",
    },
    {
      question: "¿Cómo funcionan las notificaciones?",
      answer: "Recibirás notificaciones cuando alguien te siga, le dé like a tu post, comente, te mencione o te envíe un mensaje. Puedes gestionar tus notificaciones desde la página de configuración.",
    },
  ]

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-4xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">Preguntas Frecuentes</h1>
          <p className="text-muted-foreground">Encuentra respuestas a las preguntas más comunes sobre Klik</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            ¿No encuentras la respuesta que buscas?
          </p>
          <a href="/contact" className="text-primary hover:underline">
            Contacta con nuestro equipo de soporte
          </a>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

