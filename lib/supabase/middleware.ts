import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Do not run code between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public pages that don't require authentication
  const publicPages = [
    "/",
    "/privacy",
    "/terms",
    "/cookies",
    "/support",
    "/faq",
    "/contact",
  ]
  
  const isPublicPage = publicPages.includes(request.nextUrl.pathname) || 
                       request.nextUrl.pathname.startsWith("/auth")

  // Redirect unauthenticated users to login (except public pages)
  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages to feed
  if (user && (request.nextUrl.pathname.startsWith("/auth") || request.nextUrl.pathname === "/")) {
    const url = request.nextUrl.clone()
    url.pathname = "/feed"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
