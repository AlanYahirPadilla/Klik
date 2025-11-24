"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface ProfileViewTrackerProps {
  profileId: string
  currentUserId?: string
}

export function ProfileViewTracker({ profileId, currentUserId }: ProfileViewTrackerProps) {
  useEffect(() => {
    if (!profileId) return

    const trackView = async () => {
      const supabase = createClient()
      
      try {
        // Don't track if viewing own profile
        const {
          data: { user },
        } = await supabase.auth.getUser()
        
        if (user && user.id === profileId) return

        // Track view (will ignore duplicates due to unique constraint)
        await supabase.from("profile_views").insert({
          profile_id: profileId,
          viewer_id: user?.id || null,
          viewed_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        })
      } catch (error) {
        // Ignore errors (e.g., duplicate views)
      }
    }

    // Delay tracking slightly to avoid blocking page load
    const timeoutId = setTimeout(trackView, 1000)

    return () => clearTimeout(timeoutId)
  }, [profileId, currentUserId])

  return null
}

