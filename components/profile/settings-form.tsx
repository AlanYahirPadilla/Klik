"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Mail, CheckCircle2, XCircle, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SettingsFormProps {
  user: {
    id: string
    email?: string
    email_confirmed_at?: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isEmailVerified, setIsEmailVerified] = useState(!!user.email_confirmed_at)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Check email verification status
  const checkEmailVerification = async () => {
    const supabase = createClient()
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser?.email_confirmed_at) {
      setIsEmailVerified(true)
    }
  }

  const handleSendVerificationEmail = async () => {
    const supabase = createClient()
    setIsSendingVerification(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email || "",
      })

      if (error) throw error

      setEmailVerificationSent(true)
      setSuccess("Email de verificación enviado. Revisa tu bandeja de entrada.")
      
      // Check verification status after a delay
      setTimeout(() => {
        checkEmailVerification()
      }, 5000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al enviar email de verificación")
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    const supabase = createClient()

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setError("Contraseña actual incorrecta")
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      setSuccess("Contraseña actualizada correctamente")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al cambiar contraseña")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Verificación de Email
          </CardTitle>
          <CardDescription>
            Verifica tu dirección de email para mejorar la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {isEmailVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Email verificado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Email no verificado</span>
                  </>
                )}
              </div>
            </div>
            {!isEmailVerified && (
              <Button
                variant="outline"
                onClick={handleSendVerificationEmail}
                disabled={isSendingVerification || emailVerificationSent}
              >
                {isSendingVerification
                  ? "Enviando..."
                  : emailVerificationSent
                    ? "Email enviado"
                    : "Enviar verificación"}
              </Button>
            )}
          </div>
          {emailVerificationSent && (
            <p className="text-sm text-muted-foreground">
              Revisa tu bandeja de entrada y haz clic en el enlace de verificación. Luego recarga esta página.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
                placeholder="Repite la nueva contraseña"
              />
            </div>

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            {success && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">{success}</div>
            )}

            <Button type="submit" className="w-full" disabled={isChangingPassword}>
              {isChangingPassword ? "Cambiando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

