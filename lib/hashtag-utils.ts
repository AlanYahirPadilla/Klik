// Function to detect and render hashtags in text
type HashtagPart = 
  | { type: "text"; content: string }
  | { type: "hashtag"; content: string; hashtag: string }

export function renderHashtags(text: string): HashtagPart[] {
  const hashtagRegex = /#(\w+)/g
  const parts: HashtagPart[] = []
  let lastIndex = 0
  let match

  while ((match = hashtagRegex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add hashtag
    parts.push({
      type: "hashtag",
      content: match[0],
      hashtag: match[1],
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

