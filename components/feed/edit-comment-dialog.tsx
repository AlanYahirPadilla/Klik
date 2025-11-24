"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { useMentionAutocomplete } from "@/hooks/use-mention-autocomplete"

interface EditCommentDialogProps {
  commentId: string
  currentContent: string
  currentImageUrl?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditCommentDialog({
  commentId,
  currentContent,
  currentImageUrl,
  open,
  onOpenChange,
  onSuccess,
}: EditCommentDialogProps) {
  const [content, setContent] = useState(currentContent)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { AutocompleteComponent } = useMentionAutocomplete({
    text: content,
    setText: setContent,
    textareaRef,
  })

  useEffect(() => {
    if (open) {
      setContent(currentContent)
      setImagePreview(currentImageUrl || null)
      setImage(null)
    }
  }, [open, currentContent, currentImageUrl])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imagePreview) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      let imageUrl = currentImageUrl

      // Upload new image if provided
      if (image) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/comments/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        imageUrl = publicUrl

        // Delete old image if exists
        if (currentImageUrl) {
          const oldPath = currentImageUrl.split("/").slice(-3).join("/")
          await supabase.storage.from("posts").remove([oldPath])
        }
      }

      // Update comment
      const { error } = await supabase
        .from("comments")
        .update({
          content: content.trim(),
          image_url: imageUrl,
          edited_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("author_id", user.id)

      if (error) throw error

      onSuccess()
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Error editing comment:", error)
      alert("Error al editar el comentario")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar comentario</DialogTitle>
          <DialogDescription>Modifica el contenido de tu comentario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Escribe un comentario..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={300}
            />
            {AutocompleteComponent}
          </div>

          {imagePreview && (
            <div className="relative inline-block rounded-lg overflow-hidden border border-border/50">
              <Image
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                width={300}
                height={300}
                className="max-h-48 w-auto"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-7 w-7 rounded-full"
                onClick={removeImage}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="edit-comment-image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Button type="button" variant="ghost" size="icon" asChild>
                <label htmlFor="edit-comment-image" className="cursor-pointer">
                  <ImageIcon className="h-4 w-4" />
                </label>
              </Button>
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  setContent((prev) => prev + emoji)
                  textareaRef.current?.focus()
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {content.length}/{300}
                </span>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={(!content.trim() && !imagePreview) || isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

