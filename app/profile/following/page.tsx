import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/profile/follow-button"
import { VerificationBadge } from "@/components/profile/verification-badge"

export default async function FollowingPage() {
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

  // Get following
  const { data: following } = await supabase
    .from("follows")
    .select(
      `
      following_id,
      profiles:following_id (
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
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false })

  // All following are already being followed by current user
  const followingIdsSet = new Set(following?.map((f) => f.following_id).filter(Boolean) || [])

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
              <UserPlus className="h-5 w-5" />
              <h1 className="text-xl font-bold">Siguiendo</h1>
            </div>
          </div>
        </header>

        {following && following.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-muted-foreground mb-2">No estás siguiendo a nadie</p>
            <p className="text-sm text-muted-foreground">Comienza a seguir a personas para ver sus posts</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {following
              ?.filter((f) => f.profiles)
              .map((follow) => {
                const followProfile = follow.profiles as any
                const isFollowing = true // Always true since these are people you're following
                const isOwnProfile = followProfile.id === user.id

                return (
                  <div key={followProfile.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <Link href={`/profile/${followProfile.username}`} className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={followProfile.avatar_url || "/placeholder.svg"} alt={followProfile.display_name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {followProfile.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm hover:underline">{followProfile.display_name}</p>
                          <VerificationBadge
                            emailVerified={followProfile.email_verified}
                            officialVerified={followProfile.official_verified}
                            role={followProfile.role}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">@{followProfile.username}</p>
                      </div>
                    </Link>
                    {!isOwnProfile && (
                      <div className="ml-4">
                        <FollowButton
                          profileId={followProfile.id}
                          initialIsFollowing={isFollowing}
                          username={followProfile.username}
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

