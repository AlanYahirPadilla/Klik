import type React from "react"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { DesktopNav } from "@/components/navigation/desktop-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopNav />
      <main className="pb-20 md:ml-72 md:pb-0">
        <div className="min-h-screen bg-background md:ml-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
