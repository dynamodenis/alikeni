import { useInvitation } from "../context"
import type { Sponsor } from "../schema"
import { Section, type BlockProps } from "./Section"

function SponsorMark({ sponsor }: { sponsor: Sponsor }) {
  return sponsor.logo ? (
    <img
      src={sponsor.logo.url}
      alt={sponsor.logo.alt ?? sponsor.name}
      width={sponsor.logo.width}
      height={sponsor.logo.height}
      loading="lazy"
      decoding="async"
      className="max-h-16 w-auto max-w-40 object-contain"
    />
  ) : (
    <span className="font-inv-display text-xl text-balance">
      {sponsor.name}
    </span>
  )
}

/**
 * Sponsors, partners or vendors: a centred row of logos. A sponsor without
 * a logo shows its name; one with a link opens it in a new tab.
 */
export function Sponsors({ eyebrow, title, tone, className }: BlockProps) {
  const { config, t } = useInvitation()
  const tile =
    "flex h-28 w-full items-center justify-center rounded-inv border border-inv-line bg-inv-bg px-5 text-center"
  return (
    <Section
      id="sponsors"
      eyebrow={eyebrow ?? t.sponsors.eyebrow}
      title={config.sponsors.title ?? title ?? t.sponsors.title}
      tone={tone}
      width="wide"
      className={className}
    >
      <ul className="flex flex-wrap justify-center gap-4 [&>li]:w-[calc((100%-1rem)/2)] sm:[&>li]:w-44">
        {config.sponsors.items.map((sponsor, i) => (
          <li key={i}>
            {sponsor.url ? (
              <a
                href={sponsor.url}
                target="_blank"
                rel="noreferrer noopener"
                className={`${tile} transition-colors hover:border-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary/40 focus-visible:outline-none`}
              >
                <SponsorMark sponsor={sponsor} />
                <span className="sr-only">{t.common.opensInNewTab}</span>
              </a>
            ) : (
              <div className={tile}>
                <SponsorMark sponsor={sponsor} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
