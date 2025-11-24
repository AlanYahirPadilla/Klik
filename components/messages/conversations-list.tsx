"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, MessageCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { NewConversationDialog } from "./new-conversation-dialog"
import Link from "next/link"

interface Conversation {
  id: string
  updated_at: string
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  other_user: {
    id: string
    username: string
    display_name: string
    avatar_url: string
    email_verified?: boolean
    official_verified?: boolean
    role?: string
  }
  unread_count: number
}

interface ConversationsListProps {
  currentUserId: string
  currentUserProfile: any
}

export function ConversationsList({ currentUserId, currentUserProfile }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadConversations()

    // Subscribe to new messages and conversation updates
    const supabase = createClient()
    const channel = supabase
      .channel("conversations-updates", {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadConversations()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          loadConversations()
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subscribed to conversations updates")
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  const loadConversations = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Get all conversations where user is a participant
      const { data: participants, error: participantsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId)

      if (participantsError) {
        console.error("Error loading participants:", participantsError)
        console.error("Error details:", JSON.stringify(participantsError, null, 2))
        setConversations([])
        setLoading(false)
        return
      }

      if (!participants || participants.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const conversationIds = participants.map((p) => p.conversation_id)

      // Get conversations with last message and other user info
      const { data: convs, error: convsError } = await supabase
        .from("conversations")
        .select(
          `
          id,
          updated_at,
          conversation_participants!inner (
            user_id,
            last_read_at,
            profiles:user_id (
              id,
              username,
              display_name,
              avatar_url,
              email_verified,
              official_verified,
              role
            )
          )
        `
        )
        .in("id", conversationIds)
        .order("updated_at", { ascending: false })

      if (convsError) {
        console.error("Error loading conversations:", convsError)
        setConversations([])
        setLoading(false)
        return
      }

      // Get last message for each conversation
      const conversationsWithMessages = await Promise.all(
        (convs || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("content, created_at, sender_id, image_url")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          // Get other user (not current user)
          const otherParticipant = (conv.conversation_participants || []).find(
            (p: any) => p.user_id !== currentUserId
          )

          if (!otherParticipant?.profiles) {
            return null
          }

          // Get unread count
          const currentUserParticipant = (conv.conversation_participants || []).find((p: any) => p.user_id === currentUserId)
          const lastReadAt = currentUserParticipant?.last_read_at || "1970-01-01"
          
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("sender_id", otherParticipant.user_id)
            .gt("created_at", lastReadAt)

          return {
            id: conv.id,
            updated_at: conv.updated_at,
            last_message: lastMessage || undefined,
            other_user: otherParticipant.profiles,
            unread_count: unreadCount || 0,
          }
        })
      )

      setConversations(conversationsWithMessages.filter((c) => c !== null) as Conversation[])
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.other_user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Cargando conversaciones...</p>
      </div>
    )
  }

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90">
        <header className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Mensajes</h1>
            <Button size="icon" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <MessageCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">No hay conversaciones</h2>
          <p className="text-[15px] text-muted-foreground max-w-md text-balance mb-6">
            Inicia una nueva conversación haciendo clic en el botón "+" arriba
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={conversation.other_user.avatar_url || "/placeholder.svg"}
                    alt={conversation.other_user.display_name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {conversation.other_user.display_name[0]}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{conversation.other_user.display_name}</p>
                  <VerificationBadge
                    emailVerified={conversation.other_user.email_verified}
                    officialVerified={conversation.other_user.official_verified}
                    role={conversation.other_user.role}
                  />
                </div>
                {conversation.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message.sender_id === currentUserId && "Tú: "}
                    {conversation.last_message.content || "📷 Imagen"}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-muted-foreground">
                {conversation.last_message &&
                  new Date(conversation.last_message.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
              </div>
            </Link>
          ))}
        </div>
      )}

      <NewConversationDialog open={showNewDialog} onOpenChange={setShowNewDialog} currentUserId={currentUserId} />
    </>
  )
}

