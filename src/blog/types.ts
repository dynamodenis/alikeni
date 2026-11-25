// The shape of a blog post and the small helpers that need no post content,
// so routes can import them without pulling every article into their chunk.
import type { TemplateCategory } from "@/templates/types"

/**
 * Text in `p`, `ul`/`ol`, `tip` and FAQ answers may link to a page on this
 * site as `[label](/path)` (rendered by `RichText`). Paths only, no outside
 * addresses. `message` cards are copied by readers and stay plain text.
 */
export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: Array<string> }
  /** A message to copy and paste, shown as a quote card. */
  | { type: "message"; label: string; text: string }
  | { type: "tip"; text: string }
  /** Questions and answers; also published as FAQPage structured data. */
  | { type: "faq"; items: Array<{ q: string; a: string }> }

export type Post = {
  slug: string
  /** H1 and <title> (kept under about 60 characters). */
  title: string
  /** Meta description and the summary on the blog index. */
  description: string
  /** YYYY-MM-DD, first published. */
  date: string
  /** YYYY-MM-DD, when the text last changed (defaults to `date`). */
  updated?: string
  readMinutes: number
  /** The occasion whose templates are shown under the post. */
  category?: TemplateCategory
  /** Slugs of posts to suggest first; newer posts fill the rest. */
  related?: Array<string>
  blocks: Array<Block>
}

/** What a list of posts shows. */
export type PostSummary = Pick<
  Post,
  "slug" | "title" | "description" | "date" | "readMinutes"
>

/** "10 November 2026". */
export const formatPostDate = (date: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))

const INLINE_LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g

export type TextPart = { text: string; href?: string }

/** Splits `[label](/path)` links out of a line of post text. */
export function parseInline(text: string): Array<TextPart> {
  const parts: Array<TextPart> = []
  let last = 0
  for (const match of text.matchAll(INLINE_LINK)) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index) })
    parts.push({ text: match[1], href: match[2] })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last) })
  return parts
}

/** Post text without link markup (structured data, word counts). */
export const plainText = (text: string): string =>
  parseInline(text)
    .map((part) => part.text)
    .join("")
