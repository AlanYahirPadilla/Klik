"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Search, MessageCircle, Bell, User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { SearchBar } from "@/components/search/search-bar"

const navItems = [
  { href: "/feed", icon: Home, label: "Inicio" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/messages", icon: MessageCircle, label: "Mensajes" },
  { href: "/notifications", icon: Bell, label: "Notificaciones" },
  { href: "/profile", icon: User, label: "Perfil" },
]

export function DesktopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false)

        setUnreadCount(count || 0)
      }
    }

    fetchUnreadCount()

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col border-r border-border/50 bg-card p-6 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
          <span className="text-2xl font-bold text-primary-foreground">K</span>
        </div>
        <span className="text-2xl font-bold tracking-tight">Klik</span>
      </div>

      <div className="mb-4">
        <SearchBar initialQuery="" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/search" && pathname?.startsWith("/search"))
          const Icon = item.icon
          const isNotifications = item.href === "/notifications"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-4 rounded-2xl px-5 py-3.5 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[15px]", isActive ? "font-semibold" : "font-medium")}>{item.label}</span>
              {isNotifications && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 px-1.5 text-xs font-semibold text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <Button
        variant="ghost"
        className="mt-auto justify-start gap-4 rounded-2xl px-5 py-3.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-6 w-6" />
        <span className="text-[15px] font-medium">Cerrar sesión</span>
      </Button>
    </nav>
  )
}
