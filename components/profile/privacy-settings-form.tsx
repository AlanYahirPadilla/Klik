"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Bell, Eye, MessageCircle } from "lucide-react"

interface PrivacySettingsFormProps {
  userId: string
  initialSettings?: {
    profile_visibility: string
    show_email: boolean
    show_location: boolean
    allow_direct_messages: boolean
    show_online_status: boolean
    email_notifications: boolean
    push_notifications: boolean
  }
}

export function PrivacySettingsForm({ userId, initialSettings }: PrivacySettingsFormProps) {
  const [settings, setSettings] = useState({
    profile_visibility: initialSettings?.profile_visibility || "public",
    show_email: initialSettings?.show_email ?? false,
    show_location: initialSettings?.show_location ?? true,
    allow_direct_messages: initialSettings?.allow_direct_messages ?? true,
    show_online_status: initialSettings?.show_online_status ?? true,
    email_notifications: initialSettings?.email_notifications ?? true,
    push_notifications: initialSettings?.push_notifications ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSave = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: upsertError } = await supabase
        .from("user_settings")
        .upsert({
          id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })

      if (upsertError) throw upsertError

      setSuccess("Configuración guardada correctamente")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar configuración")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacidad
          </CardTitle>
          <CardDescription>Controla quién puede ver tu información</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profile_visibility">Visibilidad del perfil</Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value) => setSettings({ ...settings, profile_visibility: value })}
            >
              <SelectTrigger id="profile_visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="followers">Solo seguidores</SelectItem>
                <SelectItem value="private">Privado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {settings.profile_visibility === "public" && "Cualquiera puede ver tu perfil"}
              {settings.profile_visibility === "followers" && "Solo tus seguidores pueden ver tu perfil"}
              {settings.profile_visibility === "private" && "Tu perfil es privado"}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_email">Mostrar email</Label>
              <p className="text-xs text-muted-foreground">Permite que otros vean tu dirección de email</p>
            </div>
            <Switch
              id="show_email"
              checked={settings.show_email}
              onCheckedChange={(checked) => setSettings({ ...settings, show_email: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_location">Mostrar ubicación</Label>
              <p className="text-xs text-muted-foreground">Muestra tu ubicación en tu perfil</p>
            </div>
            <Switch
              id="show_location"
              checked={settings.show_location}
              onCheckedChange={(checked) => setSettings({ ...settings, show_location: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_direct_messages">Permitir mensajes directos</Label>
              <p className="text-xs text-muted-foreground">Permite que otros usuarios te envíen mensajes</p>
            </div>
            <Switch
              id="allow_direct_messages"
              checked={settings.allow_direct_messages}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_direct_messages: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_online_status">Mostrar estado en línea</Label>
              <p className="text-xs text-muted-foreground">Muestra cuando estás en línea</p>
            </div>
            <Switch
              id="show_online_status"
              checked={settings.show_online_status}
              onCheckedChange={(checked) => setSettings({ ...settings, show_online_status: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>Gestiona tus preferencias de notificaciones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">Notificaciones por email</Label>
              <p className="text-xs text-muted-foreground">Recibe notificaciones por correo electrónico</p>
            </div>
            <Switch
              id="email_notifications"
              checked={settings.email_notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push_notifications">Notificaciones push</Label>
              <p className="text-xs text-muted-foreground">Recibe notificaciones en el navegador</p>
            </div>
            <Switch
              id="push_notifications"
              checked={settings.push_notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {success && <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">{success}</div>}

      <Button onClick={handleSave} className="w-full" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar configuración"}
      </Button>
    </div>
  )
}

