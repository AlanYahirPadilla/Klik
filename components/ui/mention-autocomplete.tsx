"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface User {
  id: string
  username: string
  display_name: string
  avatar_url?: string
}

interface MentionAutocompleteProps {
  text: string
  cursorPosition: number
  onSelect: (username: string) => void
  onClose: () => void
}

export function MentionAutocomplete({ text, cursorPosition, onSelect, onClose }: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Extract the current mention query
    const textBeforeCursor = text.substring(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (!mentionMatch) {
      onClose()
      return
    }

    const query = mentionMatch[1].toLowerCase()

    if (query.length === 0) {
      // Show recent/suggested users
      loadSuggestedUsers()
    } else {
      // Search users
      searchUsers(query)
    }
  }, [text, cursorPosition])

  const loadSuggestedUsers = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Get users you follow or recent interactions
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .neq("id", user.id)
        .limit(5)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading suggested users:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (query: string) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq("id", user.id)
        .limit(8)

      if (error) throw error
      setUsers(data || [])
      setSelectedIndex(0)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (users.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % users.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length)
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      handleSelect(users[selectedIndex].username)
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  const handleSelect = (username: string) => {
    onSelect(username)
    onClose()
  }

  if (users.length === 0 && !loading) {
    return null
  }

  return (
    <div
      className="absolute z-50 w-64 rounded-lg border bg-background shadow-lg"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {loading ? (
        <div className="p-3 text-sm text-muted-foreground">Buscando...</div>
      ) : (
        <div ref={listRef} className="max-h-64 overflow-y-auto">
          {users.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 p-3 text-left hover:bg-accent",
                index === selectedIndex && "bg-accent"
              )}
              onClick={() => handleSelect(user.username)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback>{user.display_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm">{user.display_name}</div>
                <div className="text-xs text-muted-foreground">@{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

