"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProfileView(profileId: string, currentUserId?: string) {
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
        })
      } catch (error) {
        // Ignore errors (e.g., duplicate views)
        console.log("View tracking:", error)
      }
    }

    // Delay tracking slightly to avoid blocking page load
    const timeoutId = setTimeout(trackView, 1000)

    return () => clearTimeout(timeoutId)
  }, [profileId, currentUserId])
}

