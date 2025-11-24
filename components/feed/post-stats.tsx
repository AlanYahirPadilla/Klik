"use client"

import { Heart, MessageCircle, Send } from "lucide-react"

interface PostStatsProps {
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked: boolean
}

export function PostStats({ likesCount, commentsCount, sharesCount, isLiked }: PostStatsProps) {
  return (
    <div className="flex items-center gap-6 px-4 py-2 text-sm text-muted-foreground border-t border-border/40">
      <div className="flex items-center gap-1.5">
        <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
        <span>{likesCount}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4" />
        <span>{commentsCount}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Send className="h-4 w-4" />
        <span>{sharesCount}</span>
      </div>
    </div>
  )
}

