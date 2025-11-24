"use client"

import { UserListsManager } from "./user-lists-manager"
import { useSearchParams, useRouter } from "next/navigation"

interface FeedListsSidebarProps {
  userId: string
}

export function FeedListsSidebar({ userId }: FeedListsSidebarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedListId = searchParams.get("list")

  return (
    <UserListsManager
      userId={userId}
      onListSelect={(listId) => {
        const params = new URLSearchParams(searchParams.toString())
        if (listId) {
          params.set("list", listId)
        } else {
          params.delete("list")
        }
        router.push(`/feed?${params.toString()}`)
      }}
      selectedListId={selectedListId}
    />
  )
}

