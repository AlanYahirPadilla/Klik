"use client"

import { useEffect, useRef } from "react"

// Iconos outline simples para el patrón
const patternIcons = ["○", "◇", "□", "△", "▢", "▣", "▤", "▥", "▦", "▧", "▨", "▩", "▪", "▫", "▬", "▭", "▮", "▯"]

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const drawPattern = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Configuración del patrón
      const spacing = 100 // Espaciado entre iconos
      const iconSize = 18 // Tamaño de los iconos
      const strokeWidth = 1.5 // Grosor del contorno

      // Color verde para los iconos (usando el color primary)
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim() || "oklch(0.35 0.08 160)"
      
      // Convertir oklch a rgba o usar directamente
      // Para simplificar, usaremos un verde con opacidad
      const iconColor = "rgba(34, 139, 58, 0.3)" // Verde con opacidad

      ctx.save()
      ctx.font = `${iconSize}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = iconColor
      ctx.strokeStyle = iconColor
      ctx.lineWidth = strokeWidth

      // Crear patrón repetitivo en toda la pantalla
      const cols = Math.ceil(canvas.width / spacing) + 2
      const rows = Math.ceil(canvas.height / spacing) + 2

      // Offset para centrar el patrón
      const offsetX = (canvas.width % spacing) / 2
      const offsetY = (canvas.height % spacing) / 2

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + offsetX
          const y = row * spacing + offsetY

          // Seleccionar icono basado en posición para crear patrón consistente
          const iconIndex = (row * cols + col) % patternIcons.length
          const icon = patternIcons[iconIndex]

          // Dibujar icono en color verde
          ctx.save()
          ctx.translate(x, y)
          
          // Dibujar el icono en color verde
          ctx.fillText(icon, 0, 0)
          
          ctx.restore()
        }
      }

      ctx.restore()
    }

    drawPattern()

    // Redibujar al cambiar tamaño
    const handleResize = () => {
      resizeCanvas()
      drawPattern()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  )
}
