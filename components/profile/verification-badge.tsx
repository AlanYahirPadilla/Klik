"use client"

import { CheckCircle2, Shield, Crown, HeadphonesIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerificationBadgeProps {
  emailVerified?: boolean
  officialVerified?: boolean
  role?: "user" | "admin" | "support" | "owner"
  className?: string
}

export function VerificationBadge({ emailVerified, officialVerified, role, className }: VerificationBadgeProps) {
  const badges: React.ReactNode[] = []

  // Owner badge (más importante, solo este si es owner)
  if (role === "owner") {
    badges.push(
      <div key="owner" className="inline-flex items-center gap-1" title="Propietario">
        <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
        <span className="hidden sm:inline text-xs font-semibold text-yellow-600 dark:text-yellow-500">Owner</span>
      </div>
    )
    // Owner solo muestra su badge, no otros
    return <div className={cn("inline-flex items-center gap-2", className)}>{badges}</div>
  }

  // Admin badge
  if (role === "admin") {
    badges.push(
      <div key="admin" className="inline-flex items-center gap-1" title="Administrador">
        <Shield className="h-4 w-4 text-red-600 dark:text-red-500" />
        <span className="hidden sm:inline text-xs font-semibold text-red-600 dark:text-red-500">Admin</span>
      </div>
    )
  }

  // Support badge
  if (role === "support") {
    badges.push(
      <div key="support" className="inline-flex items-center gap-1" title="Soporte">
        <HeadphonesIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />
        <span className="hidden sm:inline text-xs font-semibold text-blue-600 dark:text-blue-500">Soporte</span>
      </div>
    )
  }

  // Official verified badge (si no es owner)
  if (officialVerified) {
    badges.push(
      <div key="official" className="inline-flex items-center gap-1" title="Verificado oficialmente">
        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-500 fill-current" />
        <span className="hidden sm:inline text-xs font-semibold text-blue-600 dark:text-blue-500">Verificado</span>
      </div>
    )
  }

  // Email verified badge (se muestra siempre si está verificado, pero solo como ícono pequeño si hay otros badges)
  if (emailVerified) {
    if (badges.length > 0) {
      // Si hay otros badges, mostrar solo el ícono pequeño
      badges.push(
        <div key="email" className="inline-flex items-center" title="Email verificado">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
        </div>
      )
    } else {
      // Si no hay otros badges, mostrar el ícono normal
      badges.push(
        <div key="email" className="inline-flex items-center gap-1" title="Email verificado">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
        </div>
      )
    }
  }

  if (badges.length === 0) return null

  return <div className={cn("inline-flex items-center gap-2", className)}>{badges}</div>
}

