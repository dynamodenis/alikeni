import type { CSSProperties } from "react"
import { Link2, MessageCircle, Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { getMessages, type Locale } from "@/lib/i18n"

export type ShareBarProps = {
  title: string
  /** Absolute URL to share. */
  url: string
  /** Colors from the invitation palette (the bar sits outside ThemeScope). */
  colors?: { primary: string; background: string; foreground: string }
  /** The invitation's locale (`config.locale`); English when omitted. */
  locale?: Locale
  className?: string
}

/** WhatsApp "send to…" link with the title and URL prefilled. */
export function whatsappShareUrl(title: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`
}

/**
 * Small inline share bar. Uses the Web Share API when the browser has it;
 * otherwise copy-link (with a toast) and a WhatsApp link. SSR-safe: the
 * server renders the fallback and `navigator` is read only after hydration
 * and inside handlers. Context-free so pages can render it outside a template.
 */
export function ShareBar({
  title,
  url,
  colors,
  locale,
  className,
}: ShareBarProps) {
  const hydrated = useHydrated()
  const t = getMessages(locale).share
  const canShare = hydrated && typeof navigator.share === "function"

  async function share() {
    try {
      await navigator.share({ title, url })
    } catch (error) {
      // AbortError: the guest closed the sheet. Anything else: offer copy.
      if (error instanceof DOMException && error.name === "AbortError") return
      await copy()
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast(t.copied, { description: url })
    } catch {
      toast.error(t.copyFailed, { description: url })
    }
  }

  const style = colors
    ? ({
        "--share-primary": colors.primary,
        "--share-bg": colors.background,
        "--share-fg": colors.foreground,
      } as CSSProperties)
    : undefined
  const button =
    "inline-flex min-h-10 items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--share-fg,currentColor)_20%,transparent)] px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--share-primary,currentColor)] hover:text-[var(--share-primary,currentColor)] focus-visible:ring-2 focus-visible:ring-[var(--share-primary,currentColor)] focus-visible:ring-offset-2 focus-visible:outline-none"

  return (
    <nav
      aria-label={t.label}
      lang={locale}
      style={style}
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 bg-[var(--share-bg,transparent)] px-4 py-6 text-[var(--share-fg,inherit)]",
        className
      )}
    >
      {canShare ? (
        <button type="button" onClick={share} className={button}>
          <Share2 className="size-4" aria-hidden="true" />
          {t.share}
        </button>
      ) : (
        <>
          <button type="button" onClick={copy} className={button}>
            <Link2 className="size-4" aria-hidden="true" />
            {t.copy}
          </button>
          <a
            href={whatsappShareUrl(title, url)}
            target="_blank"
            rel="noreferrer noopener"
            className={button}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            WhatsApp
          </a>
        </>
      )}
    </nav>
  )
}
