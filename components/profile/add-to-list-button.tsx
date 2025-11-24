"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ListPlus } from "lucide-react"
import { AddToListDialog } from "@/components/lists/add-to-list-dialog"
import { createClient } from "@/lib/supabase/client"

interface AddToListButtonProps {
  targetUserId: string
  size?: "default" | "sm"
}

export function AddToListButton({ targetUserId, size = "default" }: AddToListButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const handleClick = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Debes estar autenticado para usar listas")
      return
    }

    if (user.id === targetUserId) {
      alert("No puedes agregarte a ti mismo a una lista")
      return
    }

    setCurrentUserId(user.id)
    setIsDialogOpen(true)
  }

  if (!currentUserId) {
    return (
      <Button
        variant="outline"
        size={size}
        className="rounded-full"
        onClick={handleClick}
      >
        <ListPlus className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
        Lista
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="rounded-full"
        onClick={() => setIsDialogOpen(true)}
      >
        <ListPlus className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-2`} />
        Lista
      </Button>
      <AddToListDialog
        userId={currentUserId}
        targetUserId={targetUserId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}

