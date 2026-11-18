import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import { Section, type SectionTone } from "./Section"
import { hostNames, signatories } from "./hosts"
import { MusicCredit } from "./MusicPlayer"

export type ClosingVariant = "signature" | "banner"

type ClosingProps = {
  variant?: ClosingVariant
  tone?: SectionTone
  /** Ornament layer behind the closing words. */
  decor?: ReactNode
  /** Shown above the closing words (monogram, seal, badge). */
  crest?: ReactNode
  className?: string
  children?: ReactNode
}

/**
 * Closing words signed in foil by whoever is inviting (see `signatories`),
 * followed by the footer. Corporate events get a formal sign-off, not
 * "With love".
 */
export function Closing({
  variant = "signature",
  tone,
  decor,
  crest,
  className,
  children,
}: ClosingProps) {
  const { config, t } = useInvitation()
  const { texts, hosts, event } = config
  const formal = event.type === "corporate"
  const signers = signatories(hosts)
  // A corporate event that lists only speakers is signed by the event itself.
  const signature =
    formal && signers.every((h) => h.role === "other")
      ? event.title
      : hostNames(signers)
  return (
    <Section
      id="closing"
      width="narrow"
      tone={tone ?? (variant === "banner" ? "tint" : "plain")}
      decor={decor}
      className={cn(
        "text-center",
        variant === "banner" && "py-28 sm:py-36",
        className
      )}
    >
      {crest && <div className="mb-8 flex justify-center">{crest}</div>}
      <p className="font-inv-display text-2xl leading-relaxed text-balance sm:text-3xl">
        {texts.closing}
      </p>
      <p className="mt-10 text-[0.7rem] tracking-[0.3em] text-inv-muted uppercase">
        {formal ? t.closing.signOffFormal : t.closing.signOff}
      </p>
      <p className="inv-foil mt-3 font-inv-display text-5xl leading-tight sm:text-6xl">
        {signature}
      </p>
      {children}
    </Section>
  )
}

/**
 * Link to the Alikeni home page for guests who want an invitation of their
 * own. `ref` says where on the invitation it was tapped ("invite-footer",
 * "invite-rsvp"), so sign-ups that start on an invitation can be counted.
 */
export function CreateYoursLink({
  source,
  className,
}: {
  source: "footer" | "rsvp"
  className?: string
}) {
  const { t } = useInvitation()
  return (
    <a
      href={`/?ref=invite-${source}`}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-inv-line px-5 text-sm text-inv-fg transition-colors hover:border-inv-primary hover:text-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inv-bg focus-visible:outline-none",
        className
      )}
    >
      {t.closing.createYours}
      <span aria-hidden="true">→</span>
    </a>
  )
}

/**
 * Footer every invitation ends with. Guests also get the "create your own"
 * link; previews are already on the site, so they keep the plain credit.
 */
export function Footer({ className }: { className?: string }) {
  const { config, mode, slug, album, t } = useInvitation()
  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-2 px-6 pt-6 pb-24 text-center text-xs text-inv-muted",
        className
      )}
    >
      {mode === "public" && album && slug && (
        <a
          href={`/i/${slug}/album`}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-inv-primary px-6 text-sm font-medium text-inv-bg transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inv-bg focus-visible:outline-none"
        >
          {t.closing.album}
          <span aria-hidden="true">→</span>
        </a>
      )}
      {config.texts.footerNote && <p>{config.texts.footerNote}</p>}
      <MusicCredit />
      <p>
        {t.closing.madeWith}{" "}
        <a
          href="/"
          className="underline-offset-4 hover:text-inv-fg hover:underline"
        >
          Alikeni
        </a>
      </p>
      {mode === "public" && (
        <CreateYoursLink source="footer" className="mt-2" />
      )}
    </footer>
  )
}
