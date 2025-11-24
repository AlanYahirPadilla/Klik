"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            {/* Logo animado con círculos */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20 animate-pulse">
              <span>K</span>
            </div>
            {/* Círculos animados alrededor */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 rounded-xl border-2 border-primary/20 animate-ping" />
              <div className="absolute inset-0 rounded-xl border-2 border-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
          </div>
          <span className="text-xl font-bold">Klik</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Inicio
          </Link>
          <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Características
          </Link>
          <Link href="/#stats" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Estadísticas
          </Link>
          <Link href="/#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Acerca de
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Comenzar ahora</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <div className="space-y-1 px-4 pb-4 pt-2">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/#features"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Características
            </Link>
            <Link
              href="/#stats"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Estadísticas
            </Link>
            <Link
              href="/#about"
              className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acerca de
            </Link>
            <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  Comenzar ahora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

