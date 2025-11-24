import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ChatWindow } from "@/components/messages/chat-window"

// Forzar renderizado dinámico - la página usa cookies para autenticación
export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user is participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .single()

  if (!participant) {
    notFound()
  }

  // Get other user
  const { data: participants } = await supabase
    .from("conversation_participants")
    .select(
      `
      user_id,
      profiles:user_id (
        id,
        username,
        display_name,
        avatar_url,
        email_verified,
        official_verified,
        role
      )
    `
    )
    .eq("conversation_id", conversationId)

  const otherUser = participants?.find((p: any) => p.user_id !== user.id)?.profiles

  if (!otherUser) {
    notFound()
  }

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={user.id}
          currentUserProfile={currentUserProfile}
          otherUser={otherUser}
        />
      </div>
    </AppLayout>
  )
}

