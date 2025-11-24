import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/profile/follow-button"
import { VerificationBadge } from "@/components/profile/verification-badge"

export default async function FollowersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get followers
  const { data: followers } = await supabase
    .from("follows")
    .select(
      `
      follower_id,
      profiles:follower_id (
        id,
        username,
        display_name,
        avatar_url,
        email_verified,
        official_verified,
        role
      )
    `
    )
    .eq("following_id", user.id)
    .order("created_at", { ascending: false })

  // Check which followers the current user is following
  const followerIds = followers?.map((f) => f.follower_id).filter(Boolean) || []
  const { data: currentUserFollows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .in("following_id", followerIds)

  const followingIds = new Set(currentUserFollows?.map((f) => f.following_id) || [])

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
              <Users className="h-5 w-5" />
              <h1 className="text-xl font-bold">Seguidores</h1>
            </div>
          </div>
        </header>

        {followers && followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">No hay seguidores</p>
            <p className="text-sm text-muted-foreground">Aún no tienes seguidores</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {followers
              ?.filter((f) => f.profiles)
              .map((follower) => {
                const followerProfile = follower.profiles as any
                const isFollowing = followingIds.has(followerProfile.id)
                const isOwnProfile = followerProfile.id === user.id

                return (
                  <div key={followerProfile.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <Link href={`/profile/${followerProfile.username}`} className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={followerProfile.avatar_url || "/placeholder.svg"} alt={followerProfile.display_name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {followerProfile.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm hover:underline">{followerProfile.display_name}</p>
                          <VerificationBadge
                            emailVerified={followerProfile.email_verified}
                            officialVerified={followerProfile.official_verified}
                            role={followerProfile.role}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">@{followerProfile.username}</p>
                      </div>
                    </Link>
                    {!isOwnProfile && (
                      <div className="ml-4">
                        <FollowButton
                          profileId={followerProfile.id}
                          initialIsFollowing={isFollowing}
                          username={followerProfile.username}
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

