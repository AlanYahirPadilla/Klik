"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { Heart, MessageCircle, UserPlus, Reply, AtSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  read: boolean
  created_at: string
  actor: {
    id: string
    username: string
    display_name: string
    avatar_url: string
    email_verified?: boolean
    official_verified?: boolean
    role?: string
  }
  post?: {
    id: string
    content: string
  }
  comment?: {
    id: string
    content: string
  }
}

interface NotificationsListProps {
  notifications: Notification[]
  currentUserId: string
}

export function NotificationsList({ notifications: initialNotifications, currentUserId }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <UserPlus className="h-5 w-5" />
      case "like":
        return <Heart className="h-5 w-5 fill-red-500 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5" />
      case "reply":
        return <Reply className="h-5 w-5" />
      case "mention":
        return <AtSign className="h-5 w-5" />
      case "message":
        return <MessageCircle className="h-5 w-5" />
      default:
        return <MessageCircle className="h-5 w-5" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor.display_name
    switch (notification.type) {
      case "follow":
        return `${actorName} empezó a seguirte`
      case "like":
        return `${actorName} le dio like a tu post`
      case "comment":
        return `${actorName} comentó en tu post`
      case "reply":
        return `${actorName} respondió a tu comentario`
      case "mention":
        if (notification.comment) {
          return `${actorName} te mencionó en un comentario`
        }
        return `${actorName} te mencionó en un post`
      case "message":
        return `${actorName} te envió un mensaje`
      default:
        return `${actorName} interactuó contigo`
    }
  }

  const findOrCreateConversation = async (otherUserId: string): Promise<string | null> => {
    const supabase = createClient()
    
    try {
      // Get all conversations where current user is a participant
      const { data: currentUserParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", currentUserId)

      if (currentUserParticipants && currentUserParticipants.length > 0) {
        const conversationIds = currentUserParticipants.map(p => p.conversation_id)
        
        // Check if there's already a conversation with the other user
        const { data: existingConv } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", otherUserId)
          .in("conversation_id", conversationIds)
          .limit(1)
          .maybeSingle()

        if (existingConv) {
          return existingConv.conversation_id
        }
      }

      // No existing conversation, create a new one
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single()

      if (convError || !newConversation) {
        console.error("Error creating conversation:", convError)
        return null
      }

      // Add both participants
      const { error: selfError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: newConversation.id, user_id: currentUserId })

      if (selfError) {
        console.error("Error adding self to conversation:", selfError)
        return null
      }

      const { error: otherError } = await supabase
        .from("conversation_participants")
        .insert({ conversation_id: newConversation.id, user_id: otherUserId })

      if (otherError) {
        console.error("Error adding other user to conversation:", otherError)
        return null
      }

      return newConversation.id
    } catch (error) {
      console.error("Error in findOrCreateConversation:", error)
      return null
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      const supabase = createClient()
      await supabase.from("notifications").update({ read: true }).eq("id", notification.id)

      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      )
    }

    // Determine where to navigate based on notification type
    let targetUrl = "#"

    switch (notification.type) {
      case "follow":
        targetUrl = `/profile/${notification.actor.username}`
        break

      case "like":
      case "comment":
        if (notification.post) {
          targetUrl = `/post/${notification.post.id}`
        } else {
          targetUrl = `/profile/${notification.actor.username}`
        }
        break

      case "reply":
        if (notification.post && notification.comment) {
          targetUrl = `/post/${notification.post.id}#comment-${notification.comment.id}`
        } else if (notification.post) {
          targetUrl = `/post/${notification.post.id}`
        } else {
          targetUrl = `/profile/${notification.actor.username}`
        }
        break

      case "mention":
        if (notification.post) {
          const commentAnchor = notification.comment ? `#comment-${notification.comment.id}` : ""
          targetUrl = `/post/${notification.post.id}${commentAnchor}`
        } else {
          targetUrl = `/profile/${notification.actor.username}`
        }
        break

      case "message":
        // Find or create conversation with the actor
        const conversationId = await findOrCreateConversation(notification.actor.id)
        if (conversationId) {
          targetUrl = `/messages/${conversationId}`
        } else {
          // Fallback to messages page
          targetUrl = `/messages`
        }
        break

      default:
        // For unknown types, try to navigate to post if available, otherwise to actor's profile
        if (notification.post) {
          targetUrl = `/post/${notification.post.id}`
        } else {
          targetUrl = `/profile/${notification.actor.username}`
        }
    }

    // Navigate to the target URL
    if (targetUrl !== "#") {
      router.push(targetUrl)
    }
  }

  return (
    <div className="divide-y divide-border/40">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          className={cn(
            "flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors cursor-pointer",
            !notification.read && "bg-primary/5"
          )}
        >
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={notification.actor.avatar_url || "/placeholder.svg"} alt={notification.actor.display_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {notification.actor.display_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-background">
              <div className="text-primary">{getNotificationIcon(notification.type)}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">{notification.actor.display_name}</p>
              <VerificationBadge
                emailVerified={notification.actor.email_verified}
                officialVerified={notification.actor.official_verified}
                role={notification.actor.role}
              />
            </div>
            <p className="text-sm text-foreground">{getNotificationText(notification)}</p>
            {notification.post && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.post.content}</p>
            )}
            {notification.comment && (notification.type === "reply" || notification.type === "mention") && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.comment.content}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(notification.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {!notification.read && (
            <div className="flex-shrink-0">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
