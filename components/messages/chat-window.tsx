"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Image as ImageIcon, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { ImageModal } from "@/components/ui/image-modal"
import { TypingIndicator } from "./typing-indicator"

interface Message {
  id: string
  content: string
  image_url?: string
  sender_id: string
  created_at: string
}

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  currentUserProfile: any
  otherUser: {
    id: string
    username: string
    display_name: string
    avatar_url: string
    email_verified?: boolean
    official_verified?: boolean
    role?: string
  }
}

export function ChatWindow({
  conversationId,
  currentUserId,
  currentUserProfile,
  otherUser,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    loadMessages()

    // Subscribe to new messages in real-time
    const supabase = createClient()
    const channel = supabase
      .channel(`conversation:${conversationId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("New message received:", payload)
          const newMessage = payload.new as Message
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
          markAsRead()
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to realtime updates")
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to realtime channel")
        }
      })

    return () => {
      console.log("Unsubscribing from realtime channel")
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)
      markAsRead()
    }
  }

  const markAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", currentUserId)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || sending) return

    const supabase = createClient()
    setSending(true)

    try {
      let imageUrl = null

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `messages/${conversationId}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Send message
      const { data: newMsg, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim() || (imageUrl ? "📷" : ""),
          image_url: imageUrl,
        })
        .select()
        .single()

      if (error) throw error

      // Optimistically add message to UI (will also come via realtime, but this makes it instant)
      if (newMsg) {
        setMessages((prev) => {
          // Check if already exists to avoid duplicates
          if (prev.some((m) => m.id === newMsg.id)) {
            return prev
          }
          return [...prev, newMsg as Message]
        })
      }

      setNewMessage("")
      removeImage()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar el mensaje")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Simulate typing indicator (in production, this would come from realtime events)
  useEffect(() => {
    if (newMessage.trim()) {
      setIsTyping(true)
      const timer = setTimeout(() => setIsTyping(false), 2000)
      return () => clearTimeout(timer)
    } else {
      setIsTyping(false)
    }
  }, [newMessage])

  return (
    <>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90">
          <div className="flex items-center gap-4 px-6 py-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} alt={otherUser.display_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {otherUser.display_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{otherUser.display_name}</p>
                <VerificationBadge
                  emailVerified={otherUser.email_verified}
                  officialVerified={otherUser.official_verified}
                  role={otherUser.role}
                />
              </div>
              <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[70%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={otherUser.avatar_url || "/placeholder.svg"}
                          alt={otherUser.display_name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {otherUser.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.image_url && (
                        <div className="mb-2">
                          <Image
                            src={message.image_url}
                            alt="Imagen"
                            width={300}
                            height={300}
                            className="rounded-lg cursor-pointer"
                            onClick={() => setSelectedImage(message.image_url || null)}
                          />
                        </div>
                      )}
                      {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            {isTyping && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 py-2 border-t border-border/40 bg-muted/20">
            <div className="relative inline-block">
              <Image
                src={imagePreview}
                alt="Preview"
                width={100}
                height={100}
                className="rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-4 py-4">
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sending || (!newMessage.trim() && !imageFile)}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt="Imagen del mensaje"
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  )
}

