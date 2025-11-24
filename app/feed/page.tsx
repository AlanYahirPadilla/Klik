import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PostCard } from "@/components/feed/post-card"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Home } from "lucide-react"
import { FeedTabs } from "@/components/feed/feed-tabs"
import { FeedListsSidebar } from "@/components/lists/feed-lists-sidebar"
import { FeedHeaderMenu } from "@/components/feed/feed-header-menu"
import { Suspense } from "react"

// Forzar renderizado dinámico - el feed cambia constantemente y no debe ser estático
export const dynamic = 'force-dynamic'

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string; list?: string }> }) {
  const params = await searchParams
  const activeTab = params.tab === "following" ? "following" : "for-you"
  const selectedListId = params.list || null
  
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get posts based on active tab and selected list
  let postsQuery = supabase
    .from("posts")
    .select(
      `
      *,
      profiles:author_id (
        id,
        username,
        display_name,
        avatar_url,
        email_verified,
        official_verified,
        role
      ),
      likes:likes(count),
      comments:comments(count)
    `,
    )

  // Filter by list if selected
  if (selectedListId) {
    const { data: listMembers } = await supabase
      .from("user_list_members")
      .select("member_id")
      .eq("list_id", selectedListId)

    const memberIds = listMembers?.map((m) => m.member_id) || []
    
    if (memberIds.length === 0) {
      // List is empty, return empty array
      postsQuery = postsQuery.eq("author_id", "00000000-0000-0000-0000-000000000000") // Impossible ID
    } else {
      postsQuery = postsQuery.in("author_id", memberIds)
    }
  } else if (activeTab === "following") {
    // Get list of users being followed
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)

    const followingIds = following?.map((f) => f.following_id) || []
    
    if (followingIds.length === 0) {
      // User is not following anyone, return empty array
      postsQuery = postsQuery.eq("author_id", "00000000-0000-0000-0000-000000000000") // Impossible ID
    } else {
      postsQuery = postsQuery.in("author_id", followingIds)
    }
  }

  const { data: posts } = await postsQuery
    .order("created_at", { ascending: false })
    .limit(20)

  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)

  const { data: userSaves } = await supabase.from("saved_posts").select("post_id").eq("user_id", user.id)

  const likedPostIds = new Set(userLikes?.map((like) => like.post_id) || [])
  const savedPostIds = new Set(userSaves?.map((save) => save.post_id) || [])

  const postsWithCounts =
    posts?.map((post) => ({
      id: post.id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      edited_at: post.edited_at,
      author: {
        id: post.profiles.id,
        username: post.profiles.username,
        display_name: post.profiles.display_name,
        avatar_url: post.profiles.avatar_url,
        email_verified: post.profiles.email_verified,
        official_verified: post.profiles.official_verified,
        role: post.profiles.role,
      },
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      shares_count: post.shares_count || 0,
      is_liked: likedPostIds.has(post.id),
      is_saved: savedPostIds.has(post.id),
    })) || []

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold tracking-tight">Inicio</h1>
                <FeedHeaderMenu />
              </div>
              <Suspense fallback={<div className="h-10 w-full bg-muted animate-pulse rounded" />}>
                <FeedTabs activeTab={activeTab} />
              </Suspense>
              {selectedListId && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Filtrando por lista seleccionada
                </div>
              )}
            </header>

            <CreatePostBox
              user={{
                id: profile.id,
                display_name: profile.display_name,
                username: profile.username,
                avatar_url: profile.avatar_url,
              }}
            />

            {postsWithCounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                  <Home className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold mb-2">
                  {selectedListId
                    ? "No hay posts de usuarios en esta lista"
                    : activeTab === "following"
                    ? "No hay posts de personas que sigues"
                    : "Tu feed está vacío"}
                </p>
                <p className="text-sm text-muted-foreground max-w-sm text-balance">
                  {selectedListId
                    ? "Agrega usuarios a esta lista para ver sus posts"
                    : activeTab === "following"
                    ? "Sigue a más usuarios para ver sus posts aquí"
                    : "Sigue a otros usuarios o crea tu primer post arriba"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {postsWithCounts.map((post) => (
                  <PostCard key={post.id} post={post} currentUserId={user.id} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - only on large screens */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="bg-card border border-border/40 rounded-lg p-4">
                <Suspense fallback={<div className="h-32 w-full bg-muted animate-pulse rounded" />}>
                  <FeedListsSidebar userId={user.id} />
                </Suspense>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
