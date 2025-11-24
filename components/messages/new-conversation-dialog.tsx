"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { VerificationBadge } from "@/components/profile/verification-badge"

interface NewConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
}

export function NewConversationDialog({ open, onOpenChange, currentUserId }: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open && searchQuery.trim()) {
      searchUsers()
    } else {
      setUsers([])
    }
  }, [searchQuery, open])

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([])
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, email_verified, official_verified, role")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("id", currentUserId)
        .limit(10)

      setUsers(data || [])
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async (userId: string) => {
    const supabase = createClient()

    try {
      // Double check authentication
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !currentUser) {
        alert("Error de autenticación. Por favor, inicia sesión nuevamente.")
        return
      }

      console.log("Creating conversation as user:", currentUser.id)
      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId)

      if (existingParticipants) {
        for (const participant of existingParticipants) {
          const { data: otherParticipants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", participant.conversation_id)
            .eq("user_id", userId)

          if (otherParticipants && otherParticipants.length > 0) {
            // Conversation exists, navigate to it
            router.push(`/messages/${participant.conversation_id}`)
            onOpenChange(false)
            return
          }
        }
      }

      // Verify user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Debes estar autenticado para crear conversaciones")
        return
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        console.error("Error details:", JSON.stringify(convError, null, 2))
        alert(`Error al crear conversación: ${convError.message}`)
        throw convError
      }

      // Add participants - first add current user, then the other user
      // We do this in two steps because the policy allows adding yourself first
      const { error: selfError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: currentUserId })

      if (selfError) {
        console.error("Error adding self as participant:", selfError)
        throw selfError
      }

      // Now add the other user (they can be added because current user is now a participant)
      const { error: otherError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: userId })

      if (otherError) {
        console.error("Error adding other participant:", otherError)
        throw otherError
      }

      router.push(`/messages/${conversation.id}`)
      onOpenChange(false)
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
          <DialogDescription>Busca un usuario para iniciar una conversación</DialogDescription>
        </DialogHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Buscando...</p>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartConversation(user.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.display_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{user.display_name}</p>
                      <VerificationBadge
                        emailVerified={user.email_verified}
                        officialVerified={user.official_verified}
                        role={user.role}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <p className="text-sm text-muted-foreground text-center py-4">No se encontraron usuarios</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Escribe para buscar usuarios</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

