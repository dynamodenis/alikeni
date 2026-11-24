import { Check, Minus } from "lucide-react"
import { BrandLink } from "@/components/brand/ButtonLink"
import {
  FREE_PUBLISHED_LIMIT,
  FREE_RSVP_LIMIT,
  formatPrice,
  type Currency,
} from "@/lib/plans"
import { cn } from "@/lib/utils"
import { Reveal } from "./Reveal"
import { SectionHeading } from "./SectionHeading"

type Item = { text: string; included?: boolean }

const SHARED: Array<Item> = [
  { text: "Every template, with your colours, fonts, photos and music" },
  { text: "RSVP, countdown, map, wishes wall and personal guest links" },
]

const FREE: Array<Item> = [
  ...SHARED,
  { text: `Up to ${FREE_RSVP_LIMIT} RSVPs` },
  { text: "Online until the day after the event" },
  { text: `${FREE_PUBLISHED_LIMIT} free invitations per account` },
  { text: "Gift section", included: false },
  { text: "Tickets and sponsors", included: false },
  { text: "Event photo album", included: false },
]

const premium = (kenya: boolean): Array<Item> => [
  ...SHARED,
  { text: "Unlimited RSVPs" },
  { text: "Stays online after the event, as a keepsake" },
  { text: "As many Premium invitations as you need" },
  {
    text: kenya
      ? "Gift section: bank accounts, M-Pesa, QR code, registry links"
      : "Gift section: bank accounts, QR code, registry links",
  },
  { text: "Event photo album: guests add their photos, we host them" },
  {
    text: "For ticketed events: prices with a “Get tickets” button to your ticket seller, and your sponsors’ logos",
  },
]

/**
 * Free next to Premium. Visitors in Kenya see shillings and dollars,
 * everyone else dollars alone (`priceCurrencies`, decided by the route).
 * Limits and prices come from `src/lib/plans.ts`.
 */
export function Pricing({ currencies }: { currencies: Array<Currency> }) {
  const prices = currencies.map((currency) => formatPrice(currency))
  const kenya = currencies.includes("KES")
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-5xl scroll-mt-24 px-4 py-28 sm:px-6"
    >
      <SectionHeading
        eyebrow="Pricing"
        title="Free to start,"
        accent="Premium when it matters"
        description="Publish and share for free. Pay once for an invitation when you want everything, with no subscription."
      />
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Plan
            name="Free"
            price="Free"
            note="No card needed"
            items={FREE}
            cta="Start for free"
          />
        </Reveal>
        <Reveal delay={0.12}>
          <Plan
            name="Premium"
            price={prices.join(" or ")}
            note="One-time payment per invitation"
            items={premium(kenya)}
            cta="Choose a template"
            highlight
          />
        </Reveal>
      </div>
      <p className="mx-auto mt-8 max-w-xl text-center body-copy">
        You upgrade from your dashboard, before or after publishing. Pay{" "}
        {kenya ? "with M-Pesa or card" : "by card"}.
      </p>
    </section>
  )
}

function Plan({
  name,
  price,
  note,
  items,
  cta,
  highlight = false,
}: {
  name: string
  price: string
  note: string
  items: Array<Item>
  cta: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl border p-7 sm:p-9",
        highlight
          ? "border-gold/50 bg-[radial-gradient(ellipse_at_top,#3a2716_0%,#1a120c_60%)]"
          : "border-gold/15 bg-[#1a120c]"
      )}
    >
      <h3 className="eyebrow">{name}</h3>
      <p className="mt-4 nums font-display text-3xl text-cream sm:text-4xl">
        {price}
      </p>
      <p className="mt-2 body-copy">{note}</p>
      <ul className="mt-8 flex flex-1 flex-col gap-3">
        {items.map(({ text, included = true }) => (
          <li
            key={text}
            className={cn(
              "flex items-start gap-3 text-sm leading-relaxed",
              included ? "text-cream/90" : "text-cream/60"
            )}
          >
            {included ? (
              <Check
                className="mt-0.5 size-4 shrink-0 text-gold"
                aria-hidden="true"
              />
            ) : (
              <Minus className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {!included && <span className="sr-only">Not included: </span>}
              {text}
            </span>
          </li>
        ))}
      </ul>
      <BrandLink
        to="/templates"
        variant={highlight ? "primary" : "outline"}
        className="mt-10 self-start"
      >
        {cta}
      </BrandLink>
    </div>
  )
}
