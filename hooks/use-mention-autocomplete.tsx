"use client"

import { useState, useEffect, useRef } from "react"
import { MentionAutocomplete } from "@/components/ui/mention-autocomplete"

interface UseMentionAutocompleteProps {
  text: string
  setText: (text: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export function useMentionAutocomplete({ text, setText, textareaRef }: UseMentionAutocompleteProps) {
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    let timeoutId: NodeJS.Timeout

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      if (!target) return
      
      // Debounce to avoid too many updates
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const position = target.selectionStart
        setCursorPosition(position)

        // Check if we're typing a mention
        const textBeforeCursor = target.value.substring(0, position)
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

        if (mentionMatch) {
          setShowAutocomplete(true)
        } else {
          setShowAutocomplete(false)
        }
      }, 50) // Small debounce to prevent blocking
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation keys when autocomplete is showing
      if (showAutocomplete && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Escape")) {
        if (e.key === "Escape") {
          e.preventDefault()
          setShowAutocomplete(false)
        }
        // Don't prevent default for other keys - let normal input work
      }
    }

    // Use capture phase to avoid conflicts
    textarea.addEventListener("input", handleInput, { passive: true })
    textarea.addEventListener("keydown", handleKeyDown, { passive: false })

    return () => {
      clearTimeout(timeoutId)
      textarea.removeEventListener("input", handleInput)
      textarea.removeEventListener("keydown", handleKeyDown)
    }
  }, [showAutocomplete, textareaRef])

  const handleSelectMention = (username: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const textBeforeCursor = text.substring(0, cursorPosition)
    const textAfterCursor = text.substring(cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const newText = textBeforeCursor.replace(/@\w*$/, `@${username} `) + textAfterCursor
      setText(newText)
      setShowAutocomplete(false)

      // Set cursor position after the mention
      setTimeout(() => {
        const newPosition = textBeforeCursor.replace(/@\w*$/, `@${username} `).length
        textarea.setSelectionRange(newPosition, newPosition)
        textarea.focus()
      }, 0)
    }
  }

  const getAutocompletePosition = () => {
    const textarea = textareaRef.current
    if (!textarea || !showAutocomplete) return null

    const position = cursorPosition
    const textBeforeCursor = text.substring(0, position)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (!mentionMatch) return null

    // Calculate position based on textarea position and cursor
    const textareaRect = textarea.getBoundingClientRect()
    const style = window.getComputedStyle(textarea)
    const lineHeight = parseInt(style.lineHeight) || 20
    const paddingTop = parseInt(style.paddingTop) || 0
    const paddingLeft = parseInt(style.paddingLeft) || 0

    // Estimate cursor position (this is approximate)
    const lines = textBeforeCursor.split("\n")
    const currentLine = lines.length - 1
    const currentLineText = lines[currentLine]
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (context) {
      context.font = style.font
      const textWidth = context.measureText(currentLineText).width
      return {
        top: textareaRect.top + paddingTop + (currentLine + 1) * lineHeight,
        left: textareaRect.left + paddingLeft + textWidth,
      }
    }

    return {
      top: textareaRect.top + paddingTop + 20,
      left: textareaRect.left + paddingLeft,
    }
  }

  const position = getAutocompletePosition()

  const AutocompleteComponent = showAutocomplete && position ? (
    <div
      ref={autocompleteRef}
      className="fixed z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <MentionAutocomplete
        text={text}
        cursorPosition={cursorPosition}
        onSelect={handleSelectMention}
        onClose={() => setShowAutocomplete(false)}
      />
    </div>
  ) : null

  return { AutocompleteComponent }
}

