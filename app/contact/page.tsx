"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Send } from "lucide-react"
import { showToast } from "@/lib/toast"
import { createClient } from "@/lib/supabase/client"
import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", user.id)
          .single()
        if (profile) {
          setName(profile.display_name || "")
          setEmail(profile.email || user.email || "")
        }
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !subject || !message) {
      showToast.error("Por favor, completa todos los campos")
      return
    }

    setIsSubmitting(true)

    try {
      // Aquí podrías enviar el formulario a un servicio de email o guardarlo en la base de datos
      // Por ahora, solo mostramos un mensaje de éxito
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulación

      showToast.success("Mensaje enviado correctamente. Te responderemos pronto.")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {
      showToast.error("Error al enviar el mensaje. Por favor, intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      <div className="relative mx-auto max-w-2xl px-4 py-12 bg-background/60 backdrop-blur-sm min-h-screen">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">Contáctanos</h1>
        <p className="text-muted-foreground">
          ¿Tienes alguna pregunta o sugerencia? Estamos aquí para ayudarte.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Asunto</Label>
          <Input
            id="subject"
            type="text"
            placeholder="¿Sobre qué quieres contactarnos?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            placeholder="Escribe tu mensaje aquí..."
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Enviar mensaje
            </>
          )}
        </Button>
      </form>

        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">También puedes contactarnos por:</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>soporte@klik.com</span>
            </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  )
}

