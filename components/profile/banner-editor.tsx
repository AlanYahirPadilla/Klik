"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Move, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import Image from "next/image"

interface BannerEditorProps {
  imageSrc: string
  onSave: (croppedImage: string) => void
  onCancel: () => void
  aspectRatio?: number // width/height
  title?: string
  outputWidth?: number
  outputHeight?: number
}

export function BannerEditor({ 
  imageSrc, 
  onSave, 
  onCancel, 
  aspectRatio = 3,
  title,
  outputWidth: customOutputWidth,
  outputHeight: customOutputHeight
}: BannerEditorProps) {
  const isAvatar = aspectRatio === 1
  const defaultOutputWidth = isAvatar ? 400 : 1500
  const defaultOutputHeight = isAvatar ? 400 : 500
  const outputWidth = customOutputWidth || defaultOutputWidth
  const outputHeight = customOutputHeight || defaultOutputHeight
  const editorTitle = title || (isAvatar ? "Ajustar foto de perfil" : "Ajustar imagen de encabezado")
  const recommendedSize = isAvatar ? "400x400px (1:1)" : "1500x500px (3:1)"
  
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Calculate container dimensions (banner should be 3:1 ratio, e.g., 1500x500)
  // For avatar, use smaller container (300x300 circle)
  const containerWidth = isAvatar ? 300 : 800
  const containerHeight = containerWidth / aspectRatio

  useEffect(() => {
    // Center image on load
    if (imageRef.current) {
      const img = imageRef.current
      const handleImageLoad = () => {
        const imgWidth = img.naturalWidth
        const imgHeight = img.naturalHeight
        
        // Calculate initial scale to cover container
        // For circle (avatar), we need to cover the entire circle (use diagonal)
        // For rectangle, cover the entire area
        let initialScale: number
        if (isAvatar) {
          // For circle, calculate scale based on diagonal to ensure full coverage
          const containerDiagonal = Math.sqrt(containerWidth * containerWidth + containerHeight * containerHeight)
          const imageDiagonal = Math.sqrt(imgWidth * imgWidth + imgHeight * imgHeight)
          initialScale = (containerDiagonal / imageDiagonal) * 1.1 // 10% extra for movement
        } else {
          const scaleX = containerWidth / imgWidth
          const scaleY = containerHeight / imgHeight
          initialScale = Math.max(scaleX, scaleY) * 1.2 // 20% extra for movement
        }
        
        setScale(initialScale)
        setPosition({ x: 0, y: 0 })
      }
      
      if (img.complete && img.naturalWidth > 0) {
        handleImageLoad()
      } else {
        img.onload = handleImageLoad
      }
    }
  }, [imageSrc, containerWidth, containerHeight, isAvatar])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!containerRef.current) return
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    setIsDragging(true)
    setDragStart({
      x: mouseX,
      y: mouseY,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !imageRef.current || !containerRef.current) return

      // Calculate mouse position relative to container
      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Calculate offset from center of container
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2
      const offsetX = mouseX - centerX - (dragStart.x - centerX)
      const offsetY = mouseY - centerY - (dragStart.y - centerY)

      // Constrain movement within bounds
      const img = imageRef.current
      const scaledWidth = img.naturalWidth * scale
      const scaledHeight = img.naturalHeight * scale

      const maxX = Math.max(0, (scaledWidth - containerWidth) / 2)
      const maxY = Math.max(0, (scaledHeight - containerHeight) / 2)

      setPosition({
        x: Math.max(-maxX, Math.min(maxX, offsetX)),
        y: Math.max(-maxY, Math.min(maxY, offsetY)),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, scale, containerWidth, containerHeight])



  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleReset = () => {
    if (imageRef.current) {
      const img = imageRef.current
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight
      
      let initialScale: number
      if (isAvatar) {
        const containerDiagonal = Math.sqrt(containerWidth * containerWidth + containerHeight * containerHeight)
        const imageDiagonal = Math.sqrt(imgWidth * imgWidth + imgHeight * imgHeight)
        initialScale = (containerDiagonal / imageDiagonal) * 1.1
      } else {
        const scaleX = containerWidth / imgWidth
        const scaleY = containerHeight / imgHeight
        initialScale = Math.max(scaleX, scaleY) * 1.2
      }
      
      setScale(initialScale)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
    }
  }

  const handleSave = () => {
    // Create canvas to crop image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !imageRef.current || !containerRef.current) return

    canvas.width = outputWidth
    canvas.height = outputHeight

    const img = imageRef.current
    const imgWidth = img.naturalWidth
    const imgHeight = img.naturalHeight

    // Image display:
    // - left: 50%, top: 50% centers reference point
    // - width/height: naturalWidth * scale, naturalHeight * scale
    // - transform: translate(calc(-50% + x), calc(-50% + y)) moves image
    //
    // The scaled image center is at (containerWidth/2 + position.x, containerHeight/2 + position.y)
    // The scaled image extends from:
    //   X: (centerX - scaledWidth/2) to (centerX + scaledWidth/2)
    //   Y: (centerY - scaledHeight/2) to (centerY + scaledHeight/2)
    //
    // The container shows (0,0) to (containerWidth, containerHeight)
    // We need to find the intersection and convert to original coordinates
    
    const scaledWidth = imgWidth * scale
    const scaledHeight = imgHeight * scale
    
    // Scaled image center in container coordinates
    const scaledCenterX = containerWidth / 2 + position.x
    const scaledCenterY = containerHeight / 2 + position.y
    
    // Scaled image bounds in container coordinates
    const scaledLeft = scaledCenterX - scaledWidth / 2
    const scaledTop = scaledCenterY - scaledHeight / 2
    
    // Visible area in scaled image coordinates (relative to scaled image top-left)
    const visibleLeft = Math.max(0, -scaledLeft)
    const visibleTop = Math.max(0, -scaledTop)
    const visibleRight = Math.min(scaledWidth, containerWidth - scaledLeft)
    const visibleBottom = Math.min(scaledHeight, containerHeight - scaledTop)
    
    // Convert to original image coordinates
    const sourceX = (visibleLeft / scale) * (outputWidth / containerWidth)
    const sourceY = (visibleTop / scale) * (outputHeight / containerHeight)
    const sourceWidth = ((visibleRight - visibleLeft) / scale) * (outputWidth / containerWidth)
    const sourceHeight = ((visibleBottom - visibleTop) / scale) * (outputHeight / containerHeight)
    
    // Clamp to image bounds
    const finalSourceX = Math.max(0, Math.min(imgWidth - sourceWidth, sourceX))
    const finalSourceY = Math.max(0, Math.min(imgHeight - sourceHeight, sourceY))
    const finalSourceWidth = Math.min(sourceWidth, imgWidth - finalSourceX)
    const finalSourceHeight = Math.min(sourceHeight, imgHeight - finalSourceY)

    // For avatar, create circular clipping
    if (isAvatar) {
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, 2 * Math.PI)
      ctx.clip()
    }

    // Draw image with rotation if needed
    if (rotation !== 0) {
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(
        img,
        finalSourceX,
        finalSourceY,
        finalSourceWidth,
        finalSourceHeight,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      )
      ctx.restore()
    } else {
      ctx.drawImage(
        img,
        finalSourceX,
        finalSourceY,
        finalSourceWidth,
        finalSourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )
    }

    // Convert to blob and create object URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        onSave(url)
      }
    }, "image/jpeg", 0.9)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`bg-card rounded-lg border border-border shadow-xl mx-4 max-h-[90vh] overflow-auto ${
        isAvatar ? "w-full max-w-md" : "w-full max-w-4xl"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{editorTitle}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-muted/50 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Arrastra la imagen para reposicionarla, usa los controles para ajustar el zoom y rotación. La imagen se recortará al tamaño {isAvatar ? "cuadrado" : "del encabezado"} ({aspectRatio}:1).
          </p>
        </div>

        {/* Image Container */}
        <div className={`flex flex-col items-center gap-4 ${isAvatar ? "p-4" : "p-6"}`}>
          <div
            ref={containerRef}
            className={`relative overflow-hidden bg-muted border-2 border-dashed border-border ${
              isAvatar ? "rounded-full" : "rounded-lg"
            }`}
            style={{
              width: isAvatar ? 300 : containerWidth,
              height: isAvatar ? 300 : containerHeight,
            }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt={isAvatar ? "Avatar preview" : "Banner preview"}
              className="absolute cursor-move select-none"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: "center center",
                maxWidth: "none",
                height: "auto",
                ...(isAvatar && {
                  clipPath: "circle(50% at 50% 50%)",
                }),
              }}
              onMouseDown={handleMouseDown}
              draggable={false}
            />
            {isAvatar && (
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)",
              }} />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="h-4 w-4 mr-1" />
              Alejar
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 3}>
              <ZoomIn className="h-4 w-4 mr-1" />
              Acercar
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4 mr-1" />
              Rotar
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Move className="h-4 w-4 mr-1" />
              Centrar
            </Button>
          </div>

          {/* Preview Info */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Zoom: {Math.round(scale * 100)}%</p>
            <p>Recomendado: {recommendedSize}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>
    </div>
  )
}

