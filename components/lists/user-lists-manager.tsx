"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, X, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface UserList {
  id: string
  name: string
  description?: string
  member_count?: number
}

interface UserListsManagerProps {
  userId: string
  onListSelect?: (listId: string | null) => void
  selectedListId?: string | null
}

export function UserListsManager({ userId, onListSelect, selectedListId }: UserListsManagerProps) {
  const [lists, setLists] = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [newListDescription, setNewListDescription] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadLists()
  }, [userId])

  const loadLists = async () => {
    const supabase = createClient()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("user_lists")
        .select(
          `
          *,
          member_count:user_list_members(count)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedLists = (data || []).map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        member_count: list.member_count?.[0]?.count || 0,
      }))

      setLists(formattedLists)
    } catch (error) {
      console.error("Error loading lists:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    const supabase = createClient()
    setCreating(true)

    try {
      const { error } = await supabase.from("user_lists").insert({
        user_id: userId,
        name: newListName.trim(),
        description: newListDescription.trim() || null,
      })

      if (error) throw error

      setNewListName("")
      setNewListDescription("")
      setIsDialogOpen(false)
      loadLists()
    } catch (error) {
      console.error("Error creating list:", error)
      alert("Error al crear la lista")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lista?")) return

    const supabase = createClient()

    try {
      const { error } = await supabase.from("user_lists").delete().eq("id", listId)

      if (error) throw error

      loadLists()
      if (selectedListId === listId && onListSelect) {
        onListSelect(null)
      }
    } catch (error) {
      console.error("Error deleting list:", error)
      alert("Error al eliminar la lista")
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando listas...</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Mis listas</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="h-7 px-2"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Nueva
        </Button>
      </div>

      <div className="space-y-1">
        {onListSelect && (
          <button
            onClick={() => onListSelect(null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedListId === null
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent text-muted-foreground"
            }`}
          >
            Todos los posts
          </button>
        )}
        {lists.map((list) => (
          <div
            key={list.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedListId === list.id
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-accent text-muted-foreground"
            }`}
          >
            <button
              onClick={() => onListSelect?.(list.id)}
              className="flex-1 flex items-center gap-2 text-left"
            >
              <Users className="h-4 w-4" />
              <span>{list.name}</span>
              <span className="text-xs opacity-70">({list.member_count})</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDeleteList(list.id)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva lista</DialogTitle>
            <DialogDescription>Crea una lista personalizada para organizar usuarios</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <Input
                placeholder="Ej: Amigos, Famosos..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción (opcional)</label>
              <Textarea
                placeholder="Describe el propósito de esta lista..."
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateList} disabled={!newListName.trim() || creating}>
                {creating ? "Creando..." : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

