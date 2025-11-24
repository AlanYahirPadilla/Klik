"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, MessageCircle, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/feed", icon: Home, label: "Inicio" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/messages", icon: MessageCircle, label: "Mensajes" },
  { href: "/notifications", icon: Bell, label: "Notificaciones" },
  { href: "/profile", icon: User, label: "Perfil" },
]

export function MobileNav() {
  const pathname = usePathname()
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 md:hidden safe-bottom">
      <div className="flex h-16 items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/search" && pathname?.startsWith("/search"))
          const Icon = item.icon
          const isNotifications = item.href === "/notifications"

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn("h-[22px] w-[22px]", isActive && "fill-primary/20 stroke-[2.5]")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
