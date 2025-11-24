"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FeedTabsProps {
  activeTab: "for-you" | "following"
}

export function FeedTabs({ activeTab }: FeedTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "for-you") {
      params.delete("tab")
      // Keep list filter if exists
    } else {
      params.set("tab", value)
      // Keep list filter if exists
    }
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="for-you">Para ti</TabsTrigger>
        <TabsTrigger value="following">Siguiendo</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

