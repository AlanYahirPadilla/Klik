"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <Button
      variant="outline"
      className="mt-6 w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
      onClick={handleSignOut}
    >
      <LogOut className="h-5 w-5" />
      <span>Cerrar sesión</span>
    </Button>
  )
}

