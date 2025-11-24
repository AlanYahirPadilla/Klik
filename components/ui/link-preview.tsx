"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface LinkPreviewData {
  title?: string
  description?: string
  image?: string
  url: string
}

interface LinkPreviewProps {
  url: string
  className?: string
}

export function LinkPreview({ url, className }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Simple fetch - in production, you'd want to use a backend API to fetch Open Graph data
        // to avoid CORS issues
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        if (response.ok) {
          const data = await response.json()
          setPreview(data)
        }
      } catch (error) {
        console.error("Error fetching link preview:", error)
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchPreview()
    }
  }, [url])

  if (loading || !preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("inline-flex items-center gap-1 text-primary hover:underline", className)}
      >
        {url}
        <ExternalLink className="h-3 w-3" />
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block rounded-lg border border-border/50 overflow-hidden hover:border-primary/50 transition-colors", className)}
    >
      {preview.image && (
        <div className="relative w-full h-48 bg-muted">
          <Image
            src={preview.image}
            alt={preview.title || "Preview"}
            fill
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        {preview.title && (
          <h4 className="font-semibold text-sm mb-1 line-clamp-2">{preview.title}</h4>
        )}
        {preview.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{preview.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          <span className="truncate">{new URL(url).hostname}</span>
        </div>
      </div>
    </a>
  )
}

