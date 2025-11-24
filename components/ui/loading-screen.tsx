"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ message = "Cargando...", fullScreen = true }: LoadingScreenProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-background",
          fullScreen ? "fixed inset-0 z-50" : "min-h-screen",
        )}
      >
        <div className="relative">
          {/* Logo animado */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 animate-pulse">
            <span className="text-3xl font-bold text-primary-foreground">K</span>
          </div>
          {/* Círculos animados alrededor */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-ping" />
            <div className="absolute inset-0 rounded-2xl border-2 border-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {message}
          {dots}
        </p>
        {/* Barra de progreso animada */}
        <div className="mt-4 h-1 w-48 overflow-hidden rounded-full bg-muted relative">
          <div className="h-full w-1/3 bg-primary animate-[slide_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
      <style jsx global>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(300%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </>
  )
}
