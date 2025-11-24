import Link from "next/link"
import { Mail, MessageCircle, HelpCircle, FileText, Shield, Heart } from "lucide-react"

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-xl font-bold text-primary-foreground shadow-lg">
                K
              </div>
              <span className="text-xl font-bold">Klik</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu red social para conectar, compartir y descubrir momentos únicos.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Hecho con amor para la comunidad</span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Producto</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Características
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Explorar
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-4 w-4" />
                  Centro de ayuda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4" />
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/faq" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="h-4 w-4" />
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-4 w-4" />
                  Términos de servicio
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Klik. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

