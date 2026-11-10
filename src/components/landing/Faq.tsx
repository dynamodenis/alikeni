import { Reveal } from "./Reveal"

export type FaqItem = { q: string; a: string }

/**
 * Questions and answers as plain, always-visible text (a definition list):
 * readable without JavaScript and by search engines.
 */
export function Faq({ items }: { items: ReadonlyArray<FaqItem> }) {
  return (
    <dl className="mx-auto grid max-w-3xl gap-4">
      {items.map((item) => (
        <Reveal
          key={item.q}
          className="rounded-3xl border border-gold/10 bg-umber/40 px-6 py-6 sm:px-8"
        >
          <dt className="font-display text-lg text-cream">{item.q}</dt>
          <dd className="mt-3 body-copy">{item.a}</dd>
        </Reveal>
      ))}
    </dl>
  )
}
