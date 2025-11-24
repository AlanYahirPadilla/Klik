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

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
          data: {
            username,
            display_name: displayName,
          },
        },
      })
      
      if (error) throw error
      
      // Si el usuario necesita confirmar su email
      if (data.user && !data.session) {
        setError(null)
        alert("¡Cuenta creada exitosamente! Por favor revisa tu email para confirmar tu cuenta antes de iniciar sesión.")
        router.push("/auth/verify-email")
      } else if (data.session) {
        // Si la sesión se creó automáticamente (email confirmado automáticamente)
        router.push("/feed")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear cuenta")
    } finally {
      setIsLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold">Únete a Klik</CardTitle>
            <p className="text-sm text-muted-foreground">Crea tu cuenta y comienza a conectar</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Tu Nombre"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11"
                />
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
