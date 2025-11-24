import { AppLayout } from "@/components/layout/app-layout"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { Bell } from "lucide-react"

// Forzar renderizado dinámico - la página usa cookies para autenticación
export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(
      `
      *,
      actor:actor_id (
        id,
        username,
        display_name,
        avatar_url,
        email_verified,
        official_verified,
        role
      ),
      post:post_id (
        id,
        content
      ),
      comment:comment_id (
        id,
        content
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // For message notifications, we need to get conversation_id
  // Check if there's a conversation_id column or if we need to get it from messages
  // For now, we'll handle it in the client component

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Notificaciones</h1>
            {unreadCount && unreadCount > 0 && (
              <span className="text-sm text-muted-foreground">{unreadCount} sin leer</span>
            )}
          </div>
        </header>

        {notifications && notifications.length > 0 ? (
          <NotificationsList notifications={notifications} currentUserId={user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <Bell className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground mb-2">No tienes notificaciones</p>
            <p className="text-sm text-muted-foreground">Te avisaremos cuando tengas nuevas interacciones</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
