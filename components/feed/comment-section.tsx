"use client"

import type React from "react"

import { useState, useEffect, useCallback, memo, useRef } from "react"
import { useMentionAutocomplete } from "@/hooks/use-mention-autocomplete"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Heart, MessageCircle, Send, ImageIcon, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { renderHashtagsAndMentions } from "@/lib/mention-utils"
import { ImageModal } from "@/components/ui/image-modal"
import { VerificationBadge } from "@/components/profile/verification-badge"
import { EditCommentDialog } from "./edit-comment-dialog"
import Image from "next/image"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"

interface CommentAuthor {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  email_verified?: boolean
  official_verified?: boolean
  role?: "user" | "admin" | "support" | "owner"
}

interface Comment {
  id: string
  content: string
  created_at: string
  edited_at?: string
  parent_comment_id: string | null
  image_url?: string | null
  author: CommentAuthor
  likes_count: number
  replies_count: number
  is_liked: boolean
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  currentUserId: string
  onCommentAdded?: () => void
}

export function CommentSection({ postId, currentUserId, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [newCommentImage, setNewCommentImage] = useState<File | null>(null)
  const [newCommentImagePreview, setNewCommentImagePreview] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [likingComments, setLikingComments] = useState<Set<string>>(new Set())
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const { AutocompleteComponent: CommentAutocomplete } = useMentionAutocomplete({
    text: newComment,
    setText: setNewComment,
    textareaRef: commentTextareaRef,
  })

  useEffect(() => {
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, currentUserId])

  const loadComments = useCallback(async () => {
    const supabase = createClient()
    
    // Load all comments (including replies)
    const { data: commentsData } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        edited_at,
        parent_comment_id,
        image_url,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url,
          email_verified,
          official_verified,
          role
        )
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (!commentsData) {
      setIsLoading(false)
      return
    }

    // Load comment likes count and user likes
    const commentIds = commentsData.map((c) => c.id)
    const { data: likesData } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .in("comment_id", commentIds)

    const { data: userLikes } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", currentUserId)
      .in("comment_id", commentIds)

    const likedCommentIds = new Set(userLikes?.map((l) => l.comment_id) || [])
    const likesCountMap = new Map<string, number>()
    
    likesData?.forEach((like) => {
      likesCountMap.set(like.comment_id, (likesCountMap.get(like.comment_id) || 0) + 1)
    })

    // Count replies for each comment
    const repliesCountMap = new Map<string, number>()
    commentsData.forEach((comment: any) => {
      if (comment.parent_comment_id) {
        repliesCountMap.set(
          comment.parent_comment_id,
          (repliesCountMap.get(comment.parent_comment_id) || 0) + 1,
        )
      }
    })

    // Transform comments
    const transformedComments = commentsData.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      edited_at: comment.edited_at,
      parent_comment_id: comment.parent_comment_id,
      image_url: comment.image_url,
      author: {
        id: comment.profiles.id,
        username: comment.profiles.username,
        display_name: comment.profiles.display_name,
        avatar_url: comment.profiles.avatar_url,
        email_verified: comment.profiles.email_verified,
        official_verified: comment.profiles.official_verified,
        role: comment.profiles.role,
      },
      likes_count: likesCountMap.get(comment.id) || 0,
      replies_count: repliesCountMap.get(comment.id) || 0,
      is_liked: likedCommentIds.has(comment.id),
    }))

    // Organize comments into tree structure
    const topLevelComments = transformedComments.filter((c) => !c.parent_comment_id)
    const repliesMap = new Map<string, Comment[]>()

    transformedComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        if (!repliesMap.has(comment.parent_comment_id)) {
          repliesMap.set(comment.parent_comment_id, [])
        }
        repliesMap.get(comment.parent_comment_id)!.push(comment)
      }
    })

    // Attach replies to their parent comments
    const commentsWithReplies = topLevelComments.map((comment) => ({
      ...comment,
      replies: repliesMap.get(comment.id) || [],
    }))

    setComments(commentsWithReplies)
    setIsLoading(false)
  }, [postId, currentUserId])

  const handleSubmit = async (e: React.FormEvent, parentId?: string, replyTextValue?: string, imageFile?: File | null) => {
    e.preventDefault()
    // Use the passed text for replies, otherwise use newComment
    const commentText = parentId ? replyTextValue : newComment
    if ((!commentText?.trim() && !imageFile) || isSubmitting) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${currentUserId}/comments/${fileName}`

        const { error: uploadError } = await supabase.storage.from("posts").upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("posts").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: currentUserId,
        content: commentText?.trim() || "",
        parent_comment_id: parentId || null,
        image_url: imageUrl,
      })

      if (error) throw error

      if (parentId) {
        // Limpiar el texto pero mantener el formulario abierto para seguir comentando
        setReplyText((prev) => ({ ...prev, [parentId]: "" }))
        // No cerrar el formulario - comentario: setReplyingTo(null)
      } else {
        setNewComment("")
        setNewCommentImage(null)
        setNewCommentImagePreview(null)
      }
      await loadComments()
      onCommentAdded?.()
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLike = useCallback(async (commentId: string, isLiked: boolean) => {
    if (likingComments.has(commentId)) return

    const supabase = createClient()
    setLikingComments((prev) => new Set(prev).add(commentId))

    try {
      if (isLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("comment_id", commentId)
      } else {
        await supabase.from("comment_likes").insert({
          user_id: currentUserId,
          comment_id: commentId,
        })
      }
      loadComments()
    } catch (error) {
      console.error("Error liking/unliking comment:", error)
    } finally {
      setLikingComments((prev) => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
    }
  }, [currentUserId, loadComments])

  const handleReplyChange = useCallback((commentId: string, value: string, shouldOpenForm?: boolean) => {
    if (value === "" && !shouldOpenForm) {
      // Cerrar formulario
      setReplyingTo(null)
      setReplyText((prev) => {
        const newText = { ...prev }
        delete newText[commentId]
        return newText
      })
    } else {
      // Abrir formulario si es necesario
      if (shouldOpenForm && replyingTo !== commentId) {
        setReplyingTo(commentId)
      }
      // Actualizar texto
      setReplyText((prev) => ({ ...prev, [commentId]: value }))
    }
  }, [replyingTo])

  const handleReplySubmit = useCallback((e: React.FormEvent, commentId: string, text: string, imageFile?: File | null) => {
    handleSubmit(e, commentId, text, imageFile)
  }, [])

  const handleShare = useCallback(async (commentId: string, authorUsername: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}#comment-${commentId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comentario de @${authorUsername}`,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Error compartiendo:", error)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert("Enlace copiado al portapapeles")
    }
  }, [postId])

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

  const handleDeleteComment = useCallback(async (commentId: string, imageUrl?: string | null) => {
    const supabase = createClient()

    try {
      // Delete image from storage if exists
      if (imageUrl) {
        const filePath = extractFilePathFromUrl(imageUrl)
        if (filePath) {
          const { error: storageError } = await supabase.storage.from("posts").remove([filePath])
          if (storageError) {
            console.error("Error deleting image from storage:", storageError)
            // Continue with comment deletion even if image deletion fails
          }
        }
      }

      // Delete comment (this will cascade delete replies and likes)
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) throw error

      await loadComments()
      onCommentAdded?.()
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Error al eliminar el comentario")
    }
  }, [loadComments, onCommentAdded])

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const commentDate = new Date(date)
    const diffMs = now.getTime() - commentDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "ahora"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  const CommentItem = memo(({ comment, isReply = false, replyingTo, replyText, onReplyChange, onReplySubmit, onLike, onShare, onDelete, isSubmitting, likingComments, currentUserId }: { 
    comment: Comment
    isReply?: boolean
    replyingTo: string | null
    replyText: Record<string, string>
    onReplyChange: (commentId: string, value: string, shouldOpenForm?: boolean) => void
    onReplySubmit: (e: React.FormEvent, commentId: string, text: string, imageFile?: File | null) => void
    onLike: (commentId: string, isLiked: boolean) => void
    onShare: (commentId: string, username: string) => void
    onDelete: (commentId: string, imageUrl?: string | null) => void
    isSubmitting: boolean
    likingComments: Set<string>
    currentUserId: string
  }) => {
    const [showReplies, setShowReplies] = useState(false)
    const [localReplyText, setLocalReplyText] = useState("")
    const [localReplyImage, setLocalReplyImage] = useState<File | null>(null)
    const [localReplyImagePreview, setLocalReplyImagePreview] = useState<string | null>(null)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isReplyingToThis = replyingTo === comment.id
    
      // Sync local state with parent state when form opens/closes
    useEffect(() => {
      if (isReplyingToThis) {
        setLocalReplyText(replyText[comment.id] || "")
        // Focus when form opens
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 0)
      } else {
        setLocalReplyText("")
        setLocalReplyImage(null)
        setLocalReplyImagePreview(null)
      }
    }, [isReplyingToThis, comment.id])

    return (
      <div id={`comment-${comment.id}`} className={cn("", isReply && "ml-12 border-l-2 border-border/20 pl-4")}>
        <div className="flex gap-3 py-3">
          <Link href={`/profile/${comment.author.username}`}>
            <Avatar className="h-8 w-8 ring-2 ring-border/50">
              <AvatarImage
                src={comment.author.avatar_url || "/placeholder.svg"}
                alt={comment.author.display_name}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {comment.author.display_name[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/profile/${comment.author.username}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.author.display_name}
              </Link>
              <VerificationBadge
                emailVerified={comment.author.email_verified}
                officialVerified={comment.author.official_verified}
                role={comment.author.role}
              />
              <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
              {comment.edited_at && (
                <>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground italic">editado</span>
                </>
              )}
            </div>
            <div className="text-sm leading-relaxed mb-2">
              {renderHashtagsAndMentions(comment.content).map((part, index) => {
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
            {comment.image_url && (
              <>
                <div
                  className="mt-2 mb-2 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <Image
                    src={comment.image_url}
                    alt="Comment image"
                    width={400}
                    height={400}
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
                <ImageModal
                  imageUrl={comment.image_url}
                  alt="Comment image"
                  isOpen={isImageModalOpen}
                  onClose={() => setIsImageModalOpen(false)}
                />
              </>
            )}

            {/* Comment actions */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 rounded-full transition-all hover:bg-red-50 dark:hover:bg-red-950/30",
                    comment.is_liked && "text-red-600 dark:text-red-500",
                  )}
                  onClick={() => onLike(comment.id, comment.is_liked)}
                  disabled={likingComments.has(comment.id)}
                >
                  <Heart className={cn("h-4 w-4", comment.is_liked && "fill-current")} />
                </Button>
                {comment.likes_count > 0 && (
                  <span className="text-xs text-muted-foreground min-w-[20px]">{comment.likes_count}</span>
                )}
              </div>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-accent/50"
                  onClick={() => {
                    if (isReplyingToThis) {
                      // Cerrar formulario
                      setLocalReplyText("")
                      onReplyChange(comment.id, "", false)
                    } else {
                      // Abrir formulario
                      setLocalReplyText("")
                      onReplyChange(comment.id, "", true)
                    }
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1" />
                  {isReplyingToThis ? "Cancelar" : "Responder"}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-accent/50 hover:text-accent-foreground"
                onClick={() => onShare(comment.id, comment.author.username)}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>

              {currentUserId === comment.author.id && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-accent/50 hover:text-accent-foreground"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <span className="text-xs">Editar</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <EditCommentDialog
                    commentId={comment.id}
                    currentContent={comment.content}
                    currentImageUrl={comment.image_url || undefined}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    onSuccess={() => {
                      window.location.reload()
                    }}
                  />
                </>
              )}
            </div>

            {/* Reply form */}
            {isReplyingToThis && (
              <div className="mt-3 space-y-2">
                {localReplyImagePreview && (
                  <div className="relative inline-block rounded-lg overflow-hidden border border-border/50">
                    <Image
                      src={localReplyImagePreview}
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
                      onClick={() => {
                        setLocalReplyImage(null)
                        setLocalReplyImagePreview(null)
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if ((!localReplyText.trim() && !localReplyImage) || isSubmitting) return
                    // Pass the local text and image directly to submit handler
                    onReplySubmit(e, comment.id, localReplyText, localReplyImage)
                    // Clear local state after submit
                    setLocalReplyText("")
                    setLocalReplyImage(null)
                    setLocalReplyImagePreview(null)
                  }}
                  className="space-y-2"
                >
                  <div className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      key={`reply-textarea-${comment.id}`}
                      placeholder={`Responder a @${comment.author.username}...`}
                      value={localReplyText}
                      onChange={(e) => {
                        // Only update local state, no parent re-render
                        setLocalReplyText(e.target.value)
                      }}
                      className="min-h-[50px] resize-none text-sm flex-1"
                      maxLength={300}
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        id={`reply-image-${comment.id}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setLocalReplyImage(file)
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              setLocalReplyImagePreview(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <label htmlFor={`reply-image-${comment.id}`} className="cursor-pointer">
                            <ImageIcon className="h-4 w-4" />
                          </label>
                        </Button>
                        <EmojiPicker
                          onEmojiSelect={(emoji) => {
                            setLocalReplyText((prev) => prev + emoji)
                            textareaRef.current?.focus()
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setLocalReplyText("")
                        setLocalReplyImage(null)
                        setLocalReplyImagePreview(null)
                        onReplyChange(comment.id, "", false)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={(!localReplyText.trim() && !localReplyImage) || isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? "..." : "Responder"}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {!showReplies ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowReplies(true)}
                  >
                    Ver {comment.replies_count} {comment.replies_count === 1 ? "respuesta" : "respuestas"}
                  </Button>
                ) : (
                  <div className="mt-2 space-y-1">
                    {comment.replies.map((reply) => (
                      <CommentItem 
                        key={reply.id} 
                        comment={reply} 
                        isReply={true}
                        replyingTo={replyingTo}
                        replyText={replyText}
                        onReplyChange={onReplyChange}
                        onReplySubmit={onReplySubmit}
                        onLike={onLike}
                        onShare={onShare}
                        onDelete={onDelete}
                        isSubmitting={isSubmitting}
                        likingComments={likingComments}
                        currentUserId={currentUserId}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowReplies(false)}
                    >
                      Ocultar respuestas
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }, (prevProps, nextProps) => {
    // Custom comparison function for memo to prevent unnecessary re-renders
    return (
      prevProps.comment.id === nextProps.comment.id &&
      prevProps.comment.content === nextProps.comment.content &&
      prevProps.comment.likes_count === nextProps.comment.likes_count &&
      prevProps.comment.replies_count === nextProps.comment.replies_count &&
      prevProps.comment.is_liked === nextProps.comment.is_liked &&
      prevProps.replyingTo === nextProps.replyingTo &&
      prevProps.isSubmitting === nextProps.isSubmitting &&
      prevProps.likingComments.size === nextProps.likingComments.size &&
      prevProps.likingComments.has(prevProps.comment.id) === nextProps.likingComments.has(nextProps.comment.id)
    )
  })

  return (
    <div className="border-t border-border/40 bg-muted/20">
      {/* Comment input */}
      <div className="p-5 pl-14">
        {newCommentImagePreview && (
          <div className="mb-2 relative inline-block rounded-lg overflow-hidden border border-border/50">
            <Image
              src={newCommentImagePreview}
              alt="Preview"
              width={400}
              height={400}
              className="max-h-48 w-auto"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 h-7 w-7 rounded-full"
              onClick={() => {
                setNewCommentImage(null)
                setNewCommentImagePreview(null)
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <form onSubmit={(e) => handleSubmit(e, undefined, undefined, newCommentImage)} className="space-y-2">
          <div className="flex gap-2 relative">
            <Textarea
              ref={commentTextareaRef}
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none text-sm flex-1"
              maxLength={300}
            />
            {CommentAutocomplete}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                id="comment-image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewCommentImage(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setNewCommentImagePreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <label htmlFor="comment-image" className="cursor-pointer">
                    <ImageIcon className="h-4 w-4" />
                  </label>
                </Button>
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setNewComment((prev) => prev + emoji)
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={(!newComment.trim() && !newCommentImage) || isSubmitting}
              size="sm"
            >
              {isSubmitting ? "..." : "Comentar"}
            </Button>
          </div>
        </form>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="p-5 pl-14 text-sm text-muted-foreground">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="p-5 pl-14 text-sm text-muted-foreground">Sé el primero en comentar</div>
      ) : (
        <div className="divide-y divide-border/30">
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyChange={handleReplyChange}
              onReplySubmit={handleReplySubmit}
              onLike={handleLike}
              onShare={handleShare}
              onDelete={handleDeleteComment}
              isSubmitting={isSubmitting}
              likingComments={likingComments}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
