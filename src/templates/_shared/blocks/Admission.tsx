import { ExternalLink } from "lucide-react"
import { useInvitation } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvLink } from "./ui"

/**
 * Tickets or entry fees: one card per tier with its price, an optional note
 * and a link to where guests buy. Prices are the host's own text.
 */
export function Admission({ eyebrow, title, tone, className }: BlockProps) {
  const { config, t } = useInvitation()
  const { tiers, note, url } = config.admission
  return (
    <Section
      id="admission"
      eyebrow={eyebrow ?? t.admission.eyebrow}
      title={config.admission.title ?? title ?? t.admission.title}
      tone={tone}
      className={className}
    >
      <div className="flex flex-col items-center gap-10">
        {tiers.length > 0 && (
          <ul className="flex w-full flex-wrap justify-center gap-4">
            {tiers.map((tier, i) => (
              <li
                key={i}
                className="flex w-full flex-col items-center gap-2 rounded-inv border border-inv-line bg-inv-bg px-6 py-8 text-center sm:w-[calc((100%-2rem)/3)] sm:min-w-56"
              >
                <p className="text-xs font-medium tracking-[0.24em] text-inv-primary uppercase">
                  {tier.label}
                </p>
                <p className="font-inv-display text-3xl leading-tight text-balance sm:text-4xl">
                  {tier.price}
                </p>
                {tier.note && (
                  <p className="text-sm leading-relaxed text-pretty text-inv-muted">
                    {tier.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {note && (
          <p className="max-w-prose text-center text-base leading-relaxed text-pretty text-inv-muted">
            {note}
          </p>
        )}
        {url && (
          <InvLink href={url} target="_blank" rel="noreferrer noopener">
            {t.admission.cta}
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">{t.common.opensInNewTab}</span>
          </InvLink>
        )}
      </div>
    </Section>
  )
}
