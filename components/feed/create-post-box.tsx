"use client"

import type React from "react"

import { useState, useRef } from "react"
import { showToast } from "@/lib/toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { useMentionAutocomplete } from "@/hooks/use-mention-autocomplete"

interface CreatePostBoxProps {
  user: {
    id: string
    display_name: string
    username: string
    avatar_url?: string
  }
}

export function CreatePostBox({ user }: CreatePostBoxProps) {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { AutocompleteComponent } = useMentionAutocomplete({
    text: content,
    setText: setContent,
    textareaRef,
  })

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
    if (!content.trim() && !image) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      let imageUrl = null

      if (image) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      })

      if (error) throw error

      setContent("")
      setImage(null)
      setImagePreview(null)
      showToast.success("Post publicado correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error creating post:", error)
      showToast.error("Error al crear el post")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-b border-border/40 bg-card p-5">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-border/50 shrink-0">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.display_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.display_name[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3 relative">
            <Textarea
              ref={textareaRef}
              placeholder="¿Qué está pasando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 p-0 text-[15px] placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={500}
            />
            {AutocompleteComponent}

            {imagePreview && (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-border/50">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="max-h-64 w-auto"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-1">
                <input type="file" id="post-image" accept="image/*" className="hidden" onChange={handleImageChange} />
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                  <label htmlFor="post-image" className="cursor-pointer">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </label>
                </Button>
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setContent((prev) => prev + emoji)
                  }}
                />
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {content.length}/{500}
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={(!content.trim() && !image) || isSubmitting}
                  className="rounded-full px-6"
                >
                  {isSubmitting ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
