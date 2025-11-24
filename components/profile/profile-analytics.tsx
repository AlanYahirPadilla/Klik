"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Eye, TrendingUp, Users } from "lucide-react"

interface ProfileAnalyticsProps {
  profileId: string
  isOwnProfile: boolean
}

export function ProfileAnalytics({ profileId, isOwnProfile }: ProfileAnalyticsProps) {
  const [stats, setStats] = useState({
    profileViews: 0,
    profileViewsToday: 0,
    totalReach: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOwnProfile) return

    loadAnalytics()
  }, [profileId, isOwnProfile])

  const loadAnalytics = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Get total profile views
      const { count: totalViews, error: totalViewsError } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)

      if (totalViewsError) {
        console.error("Error fetching total views:", totalViewsError)
      }

      // Get today's views
      const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD format
      const { count: todayViews, error: todayViewsError } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId)
        .eq("viewed_date", today)

      if (todayViewsError) {
        console.error("Error fetching today's views:", todayViewsError)
      }

      // Get unique viewers (reach) - count distinct viewer_ids
      const { data: uniqueViewersData, error: uniqueViewersError } = await supabase
        .from("profile_views")
        .select("viewer_id")
        .eq("profile_id", profileId)
        .not("viewer_id", "is", null)

      if (uniqueViewersError) {
        console.error("Error fetching unique viewers:", uniqueViewersError)
      }

      const uniqueViewerIds = new Set(uniqueViewersData?.map((v) => v.viewer_id).filter(Boolean) || [])
      const uniqueViewers = uniqueViewerIds.size

      setStats({
        profileViews: totalViews || 0,
        profileViewsToday: todayViews || 0,
        totalReach: uniqueViewers || 0,
      })
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOwnProfile) {
    return null
  }

  if (loading) {
    return (
      <div className="border-t border-border/40 bg-muted/20 px-6 py-4">
        <div className="text-sm text-muted-foreground">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="border-t border-border/40 bg-muted/20 px-6 py-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Estadísticas</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Eye className="h-4 w-4" />
            <span className="text-xs">Vistas totales</span>
          </div>
          <span className="text-lg font-bold">{stats.profileViews}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Hoy</span>
          </div>
          <span className="text-lg font-bold">{stats.profileViewsToday}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">Alcance</span>
          </div>
          <span className="text-lg font-bold">{stats.totalReach}</span>
        </div>
      </div>
    </div>
  )
}

