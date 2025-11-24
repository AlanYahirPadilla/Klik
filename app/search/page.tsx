import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { SearchResults } from "@/components/search/search-results"
import { SearchBar } from "@/components/search/search-bar"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const params = await searchParams
  const query = params.q || ""
  const type = params.type || "all"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight mb-4">Búsqueda</h1>
          <SearchBar initialQuery={query} />
        </header>

        {query ? (
          <SearchResults query={query} type={type} currentUserId={user.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-lg font-semibold text-muted-foreground mb-2">Busca usuarios, posts y hashtags</p>
            <p className="text-sm text-muted-foreground">Escribe en la barra de búsqueda para comenzar</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

