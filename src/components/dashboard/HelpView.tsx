import { ChevronDown, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BrandLink } from "@/components/brand/ButtonLink"
import { SectionId } from "@/templates/_shared/schema"
import {
  HELP_AFTER,
  HELP_FIXES,
  HELP_PLANS,
  HELP_SECTIONS,
  HELP_STEPS,
  HELP_TABS,
  type HelpTopic,
} from "./help-content"

const CONTENTS = [
  { id: "start", label: "The five steps" },
  { id: "tabs", label: "The editor, tab by tab" },
  { id: "sections", label: "The sections guests see" },
  { id: "after", label: "After you publish" },
  { id: "plans", label: "Free and Premium" },
  { id: "fixes", label: "If something looks wrong" },
]

/** The in-app guide: static, so it loads with no request of its own. */
export function HelpView() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14">
      <header>
        <p className="text-sm text-muted-foreground">Help</p>
        <h1 className="font-display text-4xl">How Alikeni works</h1>
        <p className="mt-3 text-muted-foreground">
          Everything you need to build an invitation yourself: what each tab in
          the editor is for, what each section shows your guests, and what
          happens after you publish.
        </p>
        <nav aria-label="On this page" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {CONTENTS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <Part
        id="start"
        title="The five steps"
        intro="From a blank account to a link in your guests’ hands."
      >
        <Accordion>
          {HELP_STEPS.map((step, i) => (
            <Fold
              key={step.title}
              group="help-steps"
              title={step.title}
              number={i + 1}
              open={i === 0}
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </Fold>
          ))}
        </Accordion>
        <BrandLink to="/templates" size="md" arrow className="self-start">
          Browse templates
        </BrandLink>
      </Part>

      <Part
        id="tabs"
        title="The editor, tab by tab"
        intro="The tabs run along the top of the editor, in this order. Open one to see what its fields mean. Your work is saved by itself a moment after you stop typing; the header says “All changes saved”."
      >
        <Accordion>
          {HELP_TABS.map((tab) => (
            <Fold
              key={tab.name}
              group="help-tabs"
              title={tab.name}
              summary={tab.summary}
              premium={tab.plan === "premium"}
            >
              <dl className="flex flex-col gap-3">
                {tab.fields.map((field) => (
                  <div key={field.name}>
                    <dt className="text-sm font-medium">{field.name}</dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">
                      {field.body}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed">
                <span className="font-medium">Where it shows: </span>
                <span className="text-muted-foreground">{tab.shows}</span>
              </p>
              {tab.tip && (
                <p className="mt-2 text-sm leading-relaxed">
                  <span className="font-medium">Good to know: </span>
                  <span className="text-muted-foreground">{tab.tip}</span>
                </p>
              )}
            </Fold>
          ))}
        </Accordion>
      </Part>

      <Part
        id="sections"
        title="The sections guests see"
        intro="An invitation is a cover followed by sections, top to bottom. This is what each one shows and which tab fills it; open one to read it. You choose their order, and switch off the ones you do not need, in the Sections tab."
      >
        <p className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">The cover </span>
          comes before everything: guests see your cover line and tap its button
          to open the invitation. If you added music, it starts with that tap. A
          guest who opens a personal link sees their own name on the cover.
        </p>
        <Accordion>
          {SectionId.options.map((id) => {
            const section = HELP_SECTIONS[id]
            return (
              <Fold
                key={id}
                group="help-sections"
                title={section.name}
                premium={section.plan === "premium"}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.guests}
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-medium">Filled in: </span>
                  <span className="text-muted-foreground">{section.tab}</span>
                </p>
                {section.needs && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Appears with: </span>
                    <span className="text-muted-foreground">
                      {section.needs}
                    </span>
                  </p>
                )}
              </Fold>
            )
          })}
        </Accordion>
      </Part>

      <Part
        id="after"
        title="After you publish"
        intro="Each invitation on your dashboard has a menu with its guest list, responses and album."
      >
        <Topics group="help-after" items={HELP_AFTER} />
      </Part>

      <Part
        id="plans"
        title="Free and Premium"
        intro="Every invitation starts free. Premium is a one-time payment for one invitation; you upgrade from the invitation’s menu or the Sharing tab."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <PlanList name="Free" items={HELP_PLANS.free} />
          <PlanList name="Premium" items={HELP_PLANS.premium} />
        </div>
      </Part>

      <Part id="fixes" title="If something looks wrong">
        <Topics group="help-fixes" items={HELP_FIXES} />
      </Part>
    </div>
  )
}

function Part({
  id,
  title,
  intro,
  children,
}: {
  id: string
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="flex scroll-mt-6 flex-col gap-5"
    >
      <div>
        <h2 id={`${id}-heading`} className="font-display text-3xl">
          {title}
        </h2>
        {intro && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Topics({ group, items }: { group: string; items: Array<HelpTopic> }) {
  return (
    <Accordion>
      {items.map((item) => (
        <Fold key={item.title} group={group} title={item.title}>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.body}
          </p>
        </Fold>
      ))}
    </Accordion>
  )
}

function Accordion({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
      {children}
    </div>
  )
}

/**
 * One row of an accordion. A native `<details>`, so it opens without
 * JavaScript; rows that share a `group` close each other.
 */
function Fold({
  group,
  title,
  summary,
  number,
  premium = false,
  open = false,
  children,
}: {
  group: string
  title: string
  /** A few words beside the title, shown while the row is closed too. */
  summary?: string
  /** Step number shown before the title. */
  number?: number
  premium?: boolean
  /** Open when the page loads. */
  open?: boolean
  children: ReactNode
}) {
  return (
    <details name={group} open={open} className="group/fold">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-3.5 select-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        {number !== undefined && (
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
          >
            {number}
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col gap-x-3 sm:flex-row sm:items-baseline">
          <span className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="font-medium">{title}</span>
            {premium && <PremiumBadge />}
          </span>
          {summary && (
            <span className="text-sm text-muted-foreground sm:truncate">
              {summary}
            </span>
          )}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open/fold:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className={cn("px-5 pb-5", number !== undefined && "pl-14")}>
        {children}
      </div>
    </details>
  )
}

function PlanList({ name, items }: { name: string; items: Array<string> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-display text-xl">{name}</h3>
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-xs">
      <Sparkles className="size-3 text-amber-300" aria-hidden="true" />
      Premium
    </span>
  )
}
