"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoadingScreen } from "@/components/ui/loading-screen"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login attempt started", { email })

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log("[v0] Supabase client created")

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        console.error("[v0] Login error:", error)
        // Mensaje más amigable para email no confirmado
        if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          setError("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else {
          throw error
        }
      }

      if (data?.user) {
        console.log("[v0] Login successful, redirecting to feed")
        // Mostrar pantalla de carga antes de redirigir
        setTimeout(() => {
          window.location.href = "/feed"
        }, 500) // Pequeño delay para mostrar la animación
        return // No cambiar isLoading a false aquí
      }
    } catch (error: unknown) {
      console.error("[v0] Login catch error:", error)
      if (error instanceof Error) {
        // Mensajes de error más amigables
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
          setError("Email o contraseña incorrectos. Por favor verifica tus credenciales.")
        } else if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          setError("Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Error al iniciar sesión. Por favor intenta nuevamente.")
      }
    } finally {
      setIsLoading(false)
      console.log("[v0] Login attempt finished")
    }
  }

  if (isLoading) {
    return <LoadingScreen message="Iniciando sesión" />
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Volver al inicio
            </Link>
          </Button>
        </div>
        <Card className="border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mb-2 flex justify-center">
              <div className="relative">
                {/* Logo animado con círculos */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
                  <span>K</span>
                </div>
                {/* Círculos animados alrededor */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Bienvenido a Klik</CardTitle>
            <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Regístrate
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
