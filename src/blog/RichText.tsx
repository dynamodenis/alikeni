import { parseInline } from "./types"

/**
 * A line of post text with its `[label](/path)` links. Plain anchors: the
 * targets are other pages of this site, known only as strings.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, index) =>
        part.href ? (
          <a
            key={index}
            href={part.href}
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-300 hover:text-gold-soft hover:decoration-gold-soft focus-visible:text-gold-soft focus-visible:outline-none"
          >
            {part.text}
          </a>
        ) : (
          part.text
        )
      )}
    </>
  )
}
