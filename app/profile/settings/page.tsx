import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SettingsForm } from "@/components/profile/settings-form"
import { PrivacySettingsForm } from "@/components/profile/privacy-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignOutButton } from "@/components/profile/sign-out-button"

// Forzar renderizado dinámico - la página usa cookies para autenticación
export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get user settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">Configuración</h1>
          </div>
        </header>

        <div className="p-4">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Cuenta</TabsTrigger>
              <TabsTrigger value="privacy">Privacidad</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="mt-6">
              <SettingsForm user={user} />
            </TabsContent>
            <TabsContent value="privacy" className="mt-6">
              <PrivacySettingsForm userId={user.id} initialSettings={userSettings || undefined} />
            </TabsContent>
          </Tabs>
          
          {/* Botón de cerrar sesión - visible en móvil y desktop */}
          <SignOutButton />
        </div>
      </div>
    </AppLayout>
  )
}

