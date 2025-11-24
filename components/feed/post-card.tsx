"use client"

"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { CommentSection } from "./comment-section"
import { ImageModal } from "@/components/ui/image-modal"
import { renderHashtagsAndMentions } from "@/lib/mention-utils"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { EditPostDialog } from "./edit-post-dialog"
import { PostStats } from "./post-stats"
import { showToast } from "@/lib/toast"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PostCardProps {
  post: {
    id: string
    content: string
    image_url?: string
    created_at: string
    edited_at?: string
    author: {
      id: string
      username: string
      display_name: string
      avatar_url?: string
      email_verified?: boolean
      official_verified?: boolean
      role?: "user" | "admin" | "support" | "owner"
    }
    likes_count: number
    comments_count: number
    shares_count: number
    is_liked: boolean
    is_saved: boolean
  }
  currentUserId: string
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked)
  const [isSaved, setIsSaved] = useState(post.is_saved)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [commentsCount, setCommentsCount] = useState(post.comments_count)
  const [isLiking, setIsLiking] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleLike = useCallback(async () => {
    if (isLiking) return

    const supabase = createClient()
    setIsLiking(true)

    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", currentUserId).eq("post_id", post.id)
        setIsLiked(false)
        setLikesCount(likesCount - 1)
      } else {
        await supabase.from("likes").insert({
          user_id: currentUserId,
          post_id: post.id,
        })
        setIsLiked(true)
        setLikesCount(likesCount + 1)
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error)
      showToast.error("Error al dar like")
    } finally {
      setIsLiking(false)
    }
  }, [isLiking, isLiked, likesCount, currentUserId, post.id])

  const handleSave = useCallback(async () => {
    const supabase = createClient()

    try {
      if (isSaved) {
        await supabase.from("saved_posts").delete().eq("user_id", currentUserId).eq("post_id", post.id)
        setIsSaved(false)
        showToast.success("Post eliminado de guardados")
      } else {
        await supabase.from("saved_posts").insert({
          user_id: currentUserId,
          post_id: post.id,
        })
        setIsSaved(true)
        showToast.success("Post guardado")
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error)
      showToast.error("Error al guardar el post")
    }
  }, [isSaved, currentUserId, post.id])

  const handleShare = useCallback(async () => {
    const supabase = createClient()
    const shareUrl = `${window.location.origin}/post/${post.id}`
    
    try {
      // Track share in database
      const { error: shareError } = await supabase
        .from("post_shares")
        .insert({
          post_id: post.id,
          user_id: currentUserId,
        })
        .select()
        .single()

      // If already shared, ignore error (unique constraint)
      if (shareError && shareError.code !== "23505") {
        console.error("Error tracking share:", shareError)
      }

      // Share using native API or clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Post de @${post.author.username}`,
            text: post.content,
            url: shareUrl,
          })
          showToast.success("Post compartido")
        } catch (error) {
          console.log("Error compartiendo:", error)
        }
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast.success("Enlace copiado al portapapeles")
      }
    } catch (error) {
      console.error("Error sharing post:", error)
      showToast.error("Error al compartir el post")
    }
  }, [post.id, post.author.username, post.content, currentUserId])

  const handleCopyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(shareUrl)
    showToast.success("Enlace copiado")
  }, [post.id])

  // Helper function to extract file path from public URL
  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      // URL format: https://[project].supabase.co/storage/v1/object/public/posts/{path}
      const match = url.match(/\/storage\/v1\/object\/public\/posts\/(.+)$/)
      return match ? match[1] : null
    } catch {
      return null
    }
  }

  const handleDeletePost = useCallback(async () => {
    const supabase = createClient()
    const toastId = showToast.loading("Eliminando post...")

    try {
      // Delete image from storage if exists
      if (post.image_url) {
        const filePath = extractFilePathFromUrl(post.image_url)
        if (filePath) {
          const { error: storageError } = await supabase.storage.from("posts").remove([filePath])
          if (storageError) {
            console.error("Error deleting image from storage:", storageError)
            // Continue with post deletion even if image deletion fails
          }
        }
      }

      // Delete post (this will cascade delete comments, likes, etc.)
      const { error } = await supabase.from("posts").delete().eq("id", post.id)

      if (error) throw error

      showToast.success("Post eliminado correctamente")
      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      showToast.error("Error al eliminar el post")
    } finally {
      toast.dismiss(toastId)
    }
  }, [post.id, post.image_url, router])

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "ahora"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  return (
    <article className="bg-card border-b border-border/40 transition-colors hover:bg-muted/20">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3 group">
            <Avatar className="h-11 w-11 ring-2 ring-border/50 transition-all group-hover:ring-primary/30">
              <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} alt={post.author.display_name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {post.author.display_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-base leading-none hover:underline">{post.author.display_name}</p>
                <VerificationBadge
                  emailVerified={post.author.email_verified}
                  officialVerified={post.author.official_verified}
                  role={post.author.role}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.created_at)}</span>
              {post.edited_at && (
                <>
                  <span>·</span>
                  <span className="text-muted-foreground italic">editado</span>
                </>
              )}
              </div>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyLink}>Copiar enlace</DropdownMenuItem>
              {currentUserId === post.author.id ? (
                <>
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Editar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    Eliminar post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={async () => {
                      const supabase = createClient()
                      const {
                        data: { user: currentUser },
                      } = await supabase.auth.getUser()
                      if (!currentUser) return

                      // Check if conversation exists
                      const { data: existingParticipants } = await supabase
                        .from("conversation_participants")
                        .select("conversation_id")
                        .eq("user_id", currentUser.id)

                      if (existingParticipants) {
                        for (const participant of existingParticipants) {
                          const { data: otherParticipants } = await supabase
                            .from("conversation_participants")
                            .select("user_id")
                            .eq("conversation_id", participant.conversation_id)
                            .eq("user_id", post.author.id)

                          if (otherParticipants && otherParticipants.length > 0) {
                            router.push(`/messages/${participant.conversation_id}`)
                            return
                          }
                        }
                      }

                      // Create new conversation
                      const { data: conversation, error: convError } = await supabase
                        .from("conversations")
                        .insert({})
                        .select()
                        .single()

                      if (convError) {
                        console.error("Error creating conversation:", convError)
                        return
                      }

                      // Add participants
                      await supabase
                        .from("conversation_participants")
                        .insert({ conversation_id: conversation.id, user_id: currentUser.id })

                      await supabase
                        .from("conversation_participants")
                        .insert({ conversation_id: conversation.id, user_id: post.author.id })

                      router.push(`/messages/${conversation.id}`)
                    }}
                  >
                    Enviar mensaje
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Reportar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Bloquear @{post.author.username}</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        {post.content && (
          <div className="pl-14">
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-balance">
              {renderHashtagsAndMentions(post.content).map((part, index) => {
                if (part.type === "hashtag") {
                  return (
                    <Link
                      key={index}
                      href={`/explore?hashtag=${part.hashtag}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {part.content}
                    </Link>
                  )
                }
                if (part.type === "mention") {
                  return (
                    <Link
                      key={index}
                      href={`/profile/${part.username}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {part.content}
                    </Link>
                  )
                }
                return <span key={index}>{part.content}</span>
              })}
            </div>
          </div>
        )}

        {/* Image */}
        {post.image_url && (
          <div className="pl-14">
            <div
              className="overflow-hidden rounded-2xl border border-border/50 bg-muted/30 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Image
                src={post.image_url || "/placeholder.svg"}
                alt="Post image"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            </div>
          </div>
        )}

        {/* Image Modal */}
        {post.image_url && (
          <ImageModal
            imageUrl={post.image_url}
            alt="Post image"
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
          />
        )}

        {/* Actions */}
        <TooltipProvider>
          <div className="flex items-center justify-between pl-14 pt-1">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-950/30",
                      isLiked && "text-red-600 dark:text-red-500",
                    )}
                    onClick={handleLike}
                    disabled={isLiking}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isLiked ? "Quitar like" : "Dar like"}</p>
                </TooltipContent>
              </Tooltip>
              {likesCount > 0 && <span className="text-sm text-muted-foreground min-w-[20px]">{likesCount}</span>}
            </div>

            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-accent/50 hover:text-accent-foreground"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comentar</p>
                </TooltipContent>
              </Tooltip>
              {commentsCount > 0 && <span className="text-sm text-muted-foreground min-w-[20px]">{commentsCount}</span>}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-accent/50 hover:text-accent-foreground"
                  onClick={handleShare}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compartir</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-9 w-9 rounded-full transition-all hover:bg-accent/50", isSaved && "text-primary")}
                  onClick={handleSave}
                >
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSaved ? "Quitar de guardados" : "Guardar post"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <PostStats
        likesCount={likesCount}
        commentsCount={commentsCount}
        sharesCount={post.shares_count || 0}
        isLiked={isLiked}
      />

      {showComments && (
        <CommentSection
          postId={post.id}
          currentUserId={currentUserId}
          onCommentAdded={() => setCommentsCount(commentsCount + 1)}
        />
      )}

      <EditPostDialog
        postId={post.id}
        currentContent={post.content}
        currentImageUrl={post.image_url}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          router.refresh()
        }}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          setIsDeleteDialogOpen(false)
          handleDeletePost()
        }}
        title="¿Eliminar post?"
        description="Esta acción no se puede deshacer. El post y todos sus comentarios serán eliminados permanentemente."
        confirmText="Eliminar"
      />
    </article>
  )
}
