import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, Bookmark, LogOut, MoreVertical } from "lucide-react"
import Link from "next/link"
import { PostCard } from "@/components/feed/post-card"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { ProfileAnalytics } from "@/components/profile/profile-analytics"
import { ProfileMenuMobile } from "@/components/profile/profile-menu-mobile"

// Forzar renderizado dinámico - la página usa cookies para autenticación
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
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

  const { data: posts } = await supabase
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
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", user.id)

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
      author: {
        id: post.profiles.id,
        username: post.profiles.username,
        display_name: post.profiles.display_name,
        avatar_url: post.profiles.avatar_url,
      },
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      is_liked: likedPostIds.has(post.id),
      is_saved: savedPostIds.has(post.id),
    })) || []

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-40 border-b border-border/40 bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 px-6 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
            <div className="flex items-center gap-2">
              {/* Desktop: Botón de configuración */}
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hidden md:flex" asChild>
                <Link href="/profile/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              {/* Mobile: Menú desplegable con opciones */}
              <ProfileMenuMobile />
            </div>
          </div>
        </header>

        <div className="border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
          {/* Banner */}
          <div className="relative w-full h-48 bg-gradient-to-br from-primary/20 to-muted overflow-hidden">
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-muted to-muted" />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="mb-6 flex items-start justify-between -mt-12">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                  {profile.display_name[0]}
                </AvatarFallback>
              </Avatar>
            </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              <VerificationBadge
                emailVerified={profile.email_verified}
                officialVerified={profile.official_verified}
                role={profile.role}
              />
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.location && (
              <p className="text-sm text-muted-foreground mt-1">📍 {profile.location}</p>
            )}
          </div>

          {profile.bio && <p className="mb-5 text-[15px] leading-relaxed text-balance">{profile.bio}</p>}

          {(profile.website || profile.twitter_url || profile.instagram_url || profile.facebook_url || profile.tiktok_url || profile.youtube_url) && (
            <div className="mb-5 flex flex-wrap gap-3">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  🌐 Sitio web
                </a>
              )}
              {profile.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  🐦 Twitter
                </a>
              )}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  📷 Instagram
                </a>
              )}
              {profile.facebook_url && (
                <a
                  href={profile.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  👥 Facebook
                </a>
              )}
              {profile.tiktok_url && (
                <a
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  🎵 TikTok
                </a>
              )}
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  ▶️ YouTube
                </a>
              )}
            </div>
          )}

          <div className="mb-5 flex gap-4 sm:gap-8 flex-wrap">
            <Link href="/profile" className="hover:opacity-70 transition-opacity">
              <span className="font-bold text-lg">{postsWithCounts.length}</span>
              <span className="ml-2 text-sm text-muted-foreground">Posts</span>
            </Link>
            <Link href="/profile/followers" className="hover:opacity-70 transition-opacity">
              <span className="font-bold text-lg">{followersCount || 0}</span>
              <span className="ml-2 text-sm text-muted-foreground">Seguidores</span>
            </Link>
            <Link href="/profile/following" className="hover:opacity-70 transition-opacity">
              <span className="font-bold text-lg">{followingCount || 0}</span>
              <span className="ml-2 text-sm text-muted-foreground">Siguiendo</span>
            </Link>
            <Link href="/profile/saved" className="hover:opacity-70 transition-opacity flex items-center gap-1.5">
              <span className="font-bold text-lg hidden sm:inline">Guardados</span>
              <Bookmark className="h-5 w-5 sm:hidden" />
            </Link>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1 rounded-full bg-transparent" variant="outline" asChild>
              <Link href="/profile/edit">Editar perfil</Link>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/profile/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          </div>
        </div>

        <ProfileAnalytics profileId={profile.id} isOwnProfile={true} />

        {postsWithCounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-lg font-semibold text-muted-foreground mb-2">No has publicado nada todavía</p>
            <p className="text-sm text-muted-foreground">Crea tu primer post desde el inicio</p>
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
