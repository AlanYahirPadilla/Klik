import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bookmark } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"

// Forzar renderizado dinámico - la página usa cookies para autenticación
export const dynamic = 'force-dynamic'

export default async function SavedPostsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get saved posts
  const { data: savedPosts } = await supabase
    .from("saved_posts")
    .select(
      `
      post_id,
      posts (
        id,
        content,
        image_url,
        created_at,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url,
          email_verified,
          official_verified,
          role
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Get likes and saves for current user
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)
  const { data: userSaves } = await supabase.from("saved_posts").select("post_id").eq("user_id", user.id)

  const likedPostIds = new Set(userLikes?.map((like) => like.post_id) || [])
  const savedPostIds = new Set(userSaves?.map((save) => save.post_id) || [])

  // Get counts for each post
  const postIds = savedPosts?.map((sp) => (sp.posts as any)?.id).filter(Boolean) || []
  const { data: likesData } = await supabase
    .from("likes")
    .select("post_id")
    .in("post_id", postIds)

  const { data: commentsData } = await supabase
    .from("comments")
    .select("post_id")
    .in("post_id", postIds)

  const likesCountMap = new Map<string, number>()
  const commentsCountMap = new Map<string, number>()

  likesData?.forEach((like) => {
    likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1)
  })

  commentsData?.forEach((comment) => {
    commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1)
  })

  const postsWithCounts =
    savedPosts
      ?.filter((sp) => sp.posts)
      .map((sp) => {
        const post = sp.posts as any
        return {
          id: post.id,
          content: post.content,
          image_url: post.image_url,
          created_at: post.created_at,
          author: {
            id: post.profiles.id,
            username: post.profiles.username,
            display_name: post.profiles.display_name,
            avatar_url: post.profiles.avatar_url,
            email_verified: post.profiles.email_verified,
            official_verified: post.profiles.official_verified,
            role: post.profiles.role,
          },
          likes_count: likesCountMap.get(post.id) || 0,
          comments_count: commentsCountMap.get(post.id) || 0,
          is_liked: likedPostIds.has(post.id),
          is_saved: savedPostIds.has(post.id),
        }
      }) || []

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              <h1 className="text-xl font-bold">Posts guardados</h1>
            </div>
          </div>
        </header>

        {postsWithCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">No hay posts guardados</p>
            <p className="text-sm text-muted-foreground">Guarda posts que te gusten para verlos más tarde</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {postsWithCounts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

