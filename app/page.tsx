import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, MessageCircle, Heart, Share2, Shield, Zap, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AnimatedBackground } from "@/components/landing/animated-background"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

async function getStats() {
  try {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Durante el build, retornar valores por defecto
      return {
        users: 0,
        posts: 0,
        connections: 0,
      }
    }

    const supabase = await createClient()
    
    const [usersCount, postsCount, followsCount] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("follows").select("*", { count: "exact", head: true }),
    ])

    return {
      users: usersCount.count || 0,
      posts: postsCount.count || 0,
      connections: followsCount.count || 0,
    }
  } catch (error) {
    // Si hay cualquier error, retornar valores por defecto
    // Esto permite que el build se complete incluso si hay problemas con Supabase
    console.error("Error getting stats:", error)
    return {
      users: 0,
      posts: 0,
      connections: 0,
    }
  }
}

export default async function HomePage() {
  const stats = await getStats()

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`
    return num.toString()
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <LandingHeader />
      
      <main className="relative min-h-screen bg-transparent">
        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          {/* Logo with animation */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              {/* Logo animado con círculos */}
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-5xl font-bold text-primary-foreground shadow-2xl shadow-primary/20 animate-pulse">
                <span>K</span>
              </div>
              {/* Círculos animados alrededor */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 animate-ping" />
                <div className="absolute inset-0 rounded-3xl border-2 border-primary/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            </div>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Bienvenido a <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Klik</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-pretty text-xl text-muted-foreground leading-relaxed sm:text-2xl">
            Conéctate con amigos, comparte momentos únicos y descubre contenido que te inspira. Tu red social, tu comunidad.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group text-base px-8" asChild>
              <Link href="/auth/signup">
                Comenzar ahora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-background/80 backdrop-blur-sm" asChild>
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border/40 bg-background/60 backdrop-blur-sm px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">¿Por qué elegir Klik?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Descubre todas las características que hacen de Klik la mejor plataforma para conectar y compartir
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Comparte tus ideas</h3>
              <p className="text-muted-foreground">
                Publica posts con imágenes, emojis y hashtags. Expresa lo que piensas de forma creativa.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Conecta con otros</h3>
              <p className="text-muted-foreground">
                Sigue a personas que te interesan, crea listas personalizadas y construye tu comunidad.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Interactúa fácilmente</h3>
              <p className="text-muted-foreground">
                Da likes, comenta, comparte y guarda tus posts favoritos. Todo en un solo lugar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Mensajes directos</h3>
              <p className="text-muted-foreground">
                Chatea en tiempo real con tus amigos. Envía mensajes de texto e imágenes instantáneamente.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Notificaciones en tiempo real</h3>
              <p className="text-muted-foreground">
                Mantente al día con todas tus interacciones. Recibe notificaciones instantáneas.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Privacidad y seguridad</h3>
              <p className="text-muted-foreground">
                Controla tu privacidad con configuraciones personalizables. Tu información está segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="border-t border-border/40 bg-background/60 backdrop-blur-sm px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                {formatNumber(stats.users)}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Usuarios activos</div>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                {formatNumber(stats.posts)}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Posts compartidos</div>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                {formatNumber(stats.connections)}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Conexiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-border/40 bg-background/60 backdrop-blur-sm px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Sobre Klik</h2>
          <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
            Klik es una plataforma social moderna diseñada para conectar personas y compartir momentos significativos.
            Nuestra misión es crear un espacio donde puedas expresarte libremente, descubrir contenido inspirador
            y construir comunidades auténticas.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Con características innovadoras como mensajería en tiempo real, notificaciones instantáneas y un sistema
            de verificación, Klik te ofrece todo lo que necesitas para mantenerte conectado con las personas que te importan.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">¿Listo para comenzar?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Únete a miles de usuarios que ya están compartiendo sus momentos en Klik
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="group text-base px-8" asChild>
              <Link href="/auth/signup">
                Crear cuenta gratis
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-background/80 backdrop-blur-sm" asChild>
              <Link href="/auth/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </div>
      </section>
      </main>
      
      <LandingFooter />
    </div>
  )
}
