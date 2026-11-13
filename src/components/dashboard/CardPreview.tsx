import { useEffect, useRef, useState } from "react"
import { postToWindow, usePreviewMessages } from "@/lib/preview-bridge"
import { cn } from "@/lib/utils"

/** The phone viewport the template thumbnails are captured at (`pnpm thumbs`). */
const VIEW = { width: 390, height: 844 }

/**
 * The top of the owner's own invitation, scaled down to the card: the
 * template preview in an iframe, fed the saved draft by postMessage (the
 * editor's channel). It is decoration inside the card's link, so it takes no
 * pointer events or focus. The frame is created only when the card nears the
 * viewport, and stays invisible until the draft is on screen, so the
 * template thumbnail behind it shows in the meantime (and for good when
 * scripts are off or the preview never answers).
 */
export function CardPreview({
  templateId,
  config,
  className,
}: {
  templateId: string
  /** The saved draft; the preview validates it before rendering. */
  config: object
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const [near, setNear] = useState(false)
  const [scale, setScale] = useState(0)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const resize = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / VIEW.width)
    )
    resize.observe(el)
    const visible = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true)
          visible.disconnect()
        }
      },
      { rootMargin: "300px" }
    )
    visible.observe(el)
    return () => {
      resize.disconnect()
      visible.disconnect()
    }
  }, [])

  usePreviewMessages(
    () => frame.current?.contentWindow,
    (message) => {
      if (message.type !== "alikeni:ready") return
      postToWindow(frame.current?.contentWindow, {
        type: "alikeni:config",
        config: config as Record<string, unknown>,
      })
      // Two frames: let the pushed draft replace the sample content first.
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
    }
  )

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {near && scale > 0 && (
        <iframe
          ref={frame}
          src={`/preview/${templateId}?device=mobile&motion=none`}
          title="Preview of your invitation"
          tabIndex={-1}
          loading="lazy"
          onLoad={() =>
            postToWindow(frame.current?.contentWindow, { type: "alikeni:ping" })
          }
          className={cn(
            "origin-top-left border-0 transition-opacity duration-300",
            shown ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: VIEW.width,
            height: VIEW.height,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  )
}
