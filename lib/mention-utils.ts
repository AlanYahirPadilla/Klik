// Function to detect and render mentions in text
type MentionPart =
  | { type: "text"; content: string }
  | { type: "mention"; content: string; username: string }

export function renderMentions(text: string): MentionPart[] {
  const mentionRegex = /@(\w+)/g
  const parts: MentionPart[] = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add mention
    parts.push({
      type: "mention",
      content: match[0],
      username: match[1],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }]
}

// Extract all mentions from text
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }

  return [...new Set(mentions)] // Remove duplicates
}

// Combine hashtags and mentions rendering
type CombinedPart =
  | { type: "text"; content: string }
  | { type: "hashtag"; content: string; hashtag: string }
  | { type: "mention"; content: string; username: string }

export function renderHashtagsAndMentions(text: string): CombinedPart[] {
  const hashtagRegex = /#(\w+)/g
  const mentionRegex = /@(\w+)/g
  const parts: Array<{ type: string; content: string; index: number; hashtag?: string; username?: string }> = []
  let match

  // Find all hashtags
  while ((match = hashtagRegex.exec(text)) !== null) {
    parts.push({
      type: "hashtag",
      content: match[0],
      index: match.index,
      hashtag: match[1],
    })
  }

  // Find all mentions
  while ((match = mentionRegex.exec(text)) !== null) {
    parts.push({
      type: "mention",
      content: match[0],
      index: match.index,
      username: match[1],
    })
  }

  // Sort by index
  parts.sort((a, b) => a.index - b.index)

  // Build result
  const result: CombinedPart[] = []
  let lastIndex = 0

  for (const part of parts) {
    // Add text before this part
    if (part.index > lastIndex) {
      result.push({
        type: "text",
        content: text.substring(lastIndex, part.index),
      })
    }

    // Add the part
    if (part.type === "hashtag") {
      result.push({
        type: "hashtag",
        content: part.content,
        hashtag: part.hashtag!,
      })
    } else if (part.type === "mention") {
      result.push({
        type: "mention",
        content: part.content,
        username: part.username!,
      })
    }

    lastIndex = part.index + part.content.length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push({
      type: "text",
      content: text.substring(lastIndex),
    })
  }

  return result.length > 0 ? result : [{ type: "text", content: text }]
}

