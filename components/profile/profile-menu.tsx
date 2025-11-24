"use client"

import { MoreHorizontal, LinkIcon, Flag, Ban, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

interface ProfileMenuProps {
  profile: {
    id: string
    username: string
    display_name: string
  }
}

export function ProfileMenu({ profile }: ProfileMenuProps) {
  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/profile/${profile.username}`
    navigator.clipboard.writeText(profileUrl)
    alert("Enlace copiado al portapapeles")
  }

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile.username}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile.display_name}`,
          text: `Mira el perfil de @${profile.username} en Klik`,
          url: profileUrl,
        })
      } catch (error) {
        console.log("Error compartiendo:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleBlock = async () => {
    if (!confirm(`¿Estás seguro de que quieres bloquear a @${profile.username}?`)) return

    const supabase = createClient()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("blocked_users").insert({
        blocker_id: user.id,
        blocked_id: profile.id,
      })

      if (error) throw error

      alert(`Has bloqueado a @${profile.username}`)
      window.location.href = "/feed"
    } catch (error) {
      console.error("Error blocking user:", error)
      alert("Error al bloquear usuario")
    }
  }

  const handleReport = () => {
    alert(`Reporte enviado para @${profile.username}. Nuestro equipo revisará el contenido.`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="mr-3 h-4 w-4" />
          Compartir perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="mr-3 h-4 w-4" />
          Copiar enlace del perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleReport}>
          <Flag className="mr-3 h-4 w-4" />
          Reportar perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive">
          <Ban className="mr-3 h-4 w-4" />
          Bloquear @{profile.username}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
