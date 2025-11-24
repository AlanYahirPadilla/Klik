"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Camera, X } from "lucide-react"
import Image from "next/image"
import { BannerEditor } from "./banner-editor"

interface EditProfileFormProps {
  profile: {
    id: string
    username: string
    display_name: string
    bio: string | null
    avatar_url: string | null
    banner_url: string | null
  }
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name)
  const [bio, setBio] = useState(profile.bio || "")
  const [location, setLocation] = useState(profile.location || "")
  const [website, setWebsite] = useState(profile.website || "")
  const [twitterUrl, setTwitterUrl] = useState(profile.twitter_url || "")
  const [instagramUrl, setInstagramUrl] = useState(profile.instagram_url || "")
  const [facebookUrl, setFacebookUrl] = useState(profile.facebook_url || "")
  const [tiktokUrl, setTiktokUrl] = useState(profile.tiktok_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtube_url || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile.banner_url || null)
  const [showBannerEditor, setShowBannerEditor] = useState(false)
  const [bannerEditorImage, setBannerEditorImage] = useState<string | null>(null)
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  const [avatarEditorImage, setAvatarEditorImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen")
        return
      }

      // Read file and show editor
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarEditorImage(result)
        setShowAvatarEditor(true)
        console.log("Avatar editor opened", { result: result?.substring(0, 50) })
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleAvatarEditorSave = (croppedImageUrl: string) => {
    // Convert data URL to File
    fetch(croppedImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
        setAvatarFile(file)
        setAvatarPreview(croppedImageUrl)
        setShowAvatarEditor(false)
        setAvatarEditorImage(null)
      })
      .catch((err) => {
        console.error("Error converting image:", err)
        setError("Error al procesar la imagen")
      })
  }

  const handleAvatarEditorCancel = () => {
    setShowAvatarEditor(false)
    setAvatarEditorImage(null)
    // Reset file input
    const input = document.getElementById("avatar-upload") as HTMLInputElement
    if (input) input.value = ""
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen")
        return
      }

      // Read file and show editor
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerEditorImage(reader.result as string)
        setShowBannerEditor(true)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleBannerEditorSave = (croppedImageUrl: string) => {
    // Convert data URL to File
    fetch(croppedImageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "banner.jpg", { type: "image/jpeg" })
        setBannerFile(file)
        setBannerPreview(croppedImageUrl)
        setShowBannerEditor(false)
        setBannerEditorImage(null)
      })
      .catch((err) => {
        console.error("Error converting image:", err)
        setError("Error al procesar la imagen")
      })
  }

  const handleBannerEditorCancel = () => {
    setShowBannerEditor(false)
    setBannerEditorImage(null)
    // Reset file input
    const input = document.getElementById("banner-upload") as HTMLInputElement
    if (input) input.value = ""
  }

  const removeBanner = () => {
    setBannerFile(null)
    setBannerPreview(null)
  }

  // Helper function to extract file path from public URL
  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const match = url.match(/\/storage\/v1\/object\/public\/posts\/(.+)$/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let avatarUrl = profile.avatar_url
      let bannerUrl = profile.banner_url

      // Upload new avatar if provided
      if (avatarFile) {
        // Delete old avatar if exists
        if (profile.avatar_url) {
          const oldFilePath = extractFilePathFromUrl(profile.avatar_url)
          if (oldFilePath) {
            await supabase.storage.from("posts").remove([oldFilePath])
          }
        }

        // Upload new avatar
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `avatar.${fileExt}`
        const filePath = `${profile.id}/avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, avatarFile, {
          upsert: true, // Replace if exists
        })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Upload new banner if provided
      if (bannerFile) {
        // Delete old banner if exists
        if (profile.banner_url) {
          const oldFilePath = extractFilePathFromUrl(profile.banner_url)
          if (oldFilePath) {
            await supabase.storage.from("posts").remove([oldFilePath])
          }
        }

        // Upload new banner
        const fileExt = bannerFile.name.split(".").pop()
        const fileName = `banner.${fileExt}`
        const filePath = `${profile.id}/banners/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, bannerFile, {
          upsert: true, // Replace if exists
        })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        bannerUrl = publicUrl
      }

      // Remove avatar if user clicked remove
      if (!avatarPreview && profile.avatar_url) {
        const oldFilePath = extractFilePathFromUrl(profile.avatar_url)
        if (oldFilePath) {
          await supabase.storage.from("posts").remove([oldFilePath])
        }
        avatarUrl = null
      }

      // Remove banner if user clicked remove
      if (!bannerPreview && profile.banner_url) {
        const oldFilePath = extractFilePathFromUrl(profile.banner_url)
        if (oldFilePath) {
          await supabase.storage.from("posts").remove([oldFilePath])
        }
        bannerUrl = null
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio: bio || null,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          location: location || null,
          website: website || null,
          twitter_url: twitterUrl || null,
          instagram_url: instagramUrl || null,
          facebook_url: facebookUrl || null,
          tiktok_url: tiktokUrl || null,
          youtube_url: youtubeUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al actualizar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {showBannerEditor && bannerEditorImage && (
        <BannerEditor
          imageSrc={bannerEditorImage}
          onSave={handleBannerEditorSave}
          onCancel={handleBannerEditorCancel}
          aspectRatio={3}
        />
      )}
      {showAvatarEditor && avatarEditorImage && (
        <BannerEditor
          imageSrc={avatarEditorImage}
          onSave={handleAvatarEditorSave}
          onCancel={handleAvatarEditorCancel}
          aspectRatio={1}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Banner Section */}
      <div className="space-y-2">
        <Label>Imagen de encabezado</Label>
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/50 bg-muted/30">
          {bannerPreview ? (
            <>
              <Image
                src={bannerPreview}
                alt="Banner preview"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <Camera className="h-4 w-4 mr-1" />
                      Cambiar
                    </label>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeBanner}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <input
                  type="file"
                  id="banner-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <Camera className="h-4 w-4 mr-1" />
                    Agregar imagen de encabezado
                  </label>
                </Button>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Recomendado: 1500x500px. Máximo 5MB.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24 ring-4 ring-border/50">
            <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={profile.display_name} />
            <AvatarFallback className="text-2xl">{profile.display_name[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-2 -right-2">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full"
              asChild
            >
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <Camera className="h-5 w-5" />
              </label>
            </Button>
          </div>
        </div>
        {avatarPreview && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Eliminar foto
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Haz clic en el ícono de cámara para cambiar tu foto de perfil
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" type="text" value={profile.username} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">El nombre de usuario no se puede cambiar</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Nombre</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Escribe algo sobre ti..."
          maxLength={200}
          rows={4}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej: Ciudad, País"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Sitio web</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-4">
        <Label>Redes sociales</Label>
        <div className="space-y-2">
          <Input
            type="url"
            value={twitterUrl}
            onChange={(e) => setTwitterUrl(e.target.value)}
            placeholder="Twitter/X URL"
          />
          <Input
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="Instagram URL"
          />
          <Input
            type="url"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="Facebook URL"
          />
          <Input
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="TikTok URL"
          />
          <Input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="YouTube URL"
          />
        </div>
      </div>

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {success && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">Perfil actualizado correctamente</div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
    </>
  )
}
