"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Plus } from "lucide-react"

interface UserList {
  id: string
  name: string
  member_count?: number
}

interface AddToListDialogProps {
  userId: string
  targetUserId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToListDialog({ userId, targetUserId, open, onOpenChange }: AddToListDialogProps) {
  const [lists, setLists] = useState<UserList[]>([])
  const [memberLists, setMemberLists] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadLists()
    }
  }, [open, userId, targetUserId])

  const loadLists = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      // Load user's lists
      const { data: listsData, error: listsError } = await supabase
        .from("user_lists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (listsError) throw listsError

      // Load which lists the target user is in
      const { data: membersData, error: membersError } = await supabase
        .from("user_list_members")
        .select("list_id")
        .eq("member_id", targetUserId)
        .in(
          "list_id",
          (listsData || []).map((l) => l.id)
        )

      if (membersError) throw membersError

      setLists(listsData || [])
      setMemberLists(new Set((membersData || []).map((m) => m.list_id)))
    } catch (error) {
      console.error("Error loading lists:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleList = async (listId: string, isMember: boolean) => {
    const supabase = createClient()

    try {
      if (isMember) {
        // Remove from list
        const { error } = await supabase
          .from("user_list_members")
          .delete()
          .eq("list_id", listId)
          .eq("member_id", targetUserId)

        if (error) throw error
        setMemberLists((prev) => {
          const newSet = new Set(prev)
          newSet.delete(listId)
          return newSet
        })
      } else {
        // Add to list
        const { error } = await supabase.from("user_list_members").insert({
          list_id: listId,
          member_id: targetUserId,
        })

        if (error) throw error
        setMemberLists((prev) => new Set(prev).add(listId))
      }
    } catch (error) {
      console.error("Error updating list:", error)
      alert("Error al actualizar la lista")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar a lista</DialogTitle>
          <DialogDescription>Selecciona las listas donde quieres agregar a este usuario</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="py-4 text-sm text-muted-foreground">Cargando listas...</div>
        ) : lists.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground">
            No tienes listas creadas. Crea una lista desde tu perfil.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {lists.map((list) => {
              const isMember = memberLists.has(list.id)
              return (
                <button
                  key={list.id}
                  onClick={() => handleToggleList(list.id, isMember)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <span className="text-sm">{list.name}</span>
                  {isMember ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

