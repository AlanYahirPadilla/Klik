"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"

interface MessageButtonProps {
  userId: string
  username: string
  size?: "default" | "sm"
}

export function MessageButton({ userId, username, size = "default" }: MessageButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartConversation = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      // Verify user is authenticated
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !currentUser) {
        alert("Debes estar autenticado para enviar mensajes")
        return
      }

      if (currentUser.id === userId) {
        alert("No puedes enviarte mensajes a ti mismo")
        return
      }

      // Check if conversation already exists
      const { data: existingParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUser.id)

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
            return
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (convError) {
        console.error("Error creating conversation:", convError)
        throw convError
      }

      // Add participants - first add current user, then the other user
      const { error: selfError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: currentUser.id })

      if (selfError) {
        console.error("Error adding self as participant:", selfError)
        throw selfError
      }

      // Now add the other user
      const { error: otherError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: conversation.id, user_id: userId })

      if (otherError) {
        console.error("Error adding other participant:", otherError)
        throw otherError
      }

      router.push(`/messages/${conversation.id}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
      alert("Error al iniciar conversación. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className={size === "sm" ? "rounded-full" : "w-full rounded-full"}
      size={size === "sm" ? "sm" : "default"}
      variant="outline"
      onClick={handleStartConversation}
      disabled={isLoading}
    >
      <MessageCircle className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
      {isLoading ? "..." : "Mensaje"}
    </Button>
  )
}

