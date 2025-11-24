"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ImageIcon, X } from "lucide-react"
import Image from "next/image"

interface CreatePostFormProps {
  profile: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export function CreatePostForm({ profile }: CreatePostFormProps) {
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imagePreview) {
      setError("Debes escribir algo o agregar una imagen")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("posts").insert({
        author_id: profile.id,
        content: content.trim(),
        image_url: imagePreview || null,
      })

      if (error) throw error

      router.push("/feed")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear post")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name} />
          <AvatarFallback>{profile.display_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold">{profile.display_name}</p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué estás pensando?"
        className="min-h-[150px] resize-none text-base"
        maxLength={500}
      />

      <div className="text-xs text-muted-foreground text-right">{content.length}/500</div>

      {imagePreview && (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
          <Image
            src={imagePreview || "/placeholder.svg"}
            alt="Preview"
            width={600}
            height={400}
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="image-upload">
          <Button type="button" variant="ghost" size="icon" className="cursor-pointer" asChild>
            <div>
              <ImageIcon className="h-5 w-5" />
            </div>
          </Button>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>

        <Button type="submit" disabled={isLoading || (!content.trim() && !imagePreview)}>
          {isLoading ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  )
}
