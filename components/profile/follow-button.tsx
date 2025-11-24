"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
  profileId: string
  initialIsFollowing: boolean
  username: string
  size?: "default" | "sm"
}

export function FollowButton({ profileId, initialIsFollowing, username, size = "default" }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFollow = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profileId)
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: profileId,
        })
      }

      setIsFollowing(!isFollowing)
      router.refresh()
    } catch (error) {
      console.error("Error following/unfollowing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className={size === "sm" ? "rounded-full" : "w-full rounded-full"}
      size={size === "sm" ? "sm" : "default"}
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isLoading ? "..." : isFollowing ? "Siguiendo" : "Seguir"}
    </Button>
  )
}
