import { Link } from "@tanstack/react-router"
import { useEffect, useId, useRef } from "react"
import { Switch } from "@/components/ui/switch"
import {
  MAX_SPONSORS,
  type SectionId,
  type Sponsor,
} from "@/templates/_shared/schema"
import { getIn } from "@/lib/set-in"
import { useEditor } from "../EditorContext"
import { ListEditor } from "../ListEditor"
import { editorCopy } from "../copy"
import { Group, TextField } from "../fields"
import { ImageField } from "../media"

type Tier = { label: string; price: string; note?: string }

const capitalise = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1)

/**
 * Shows or hides a section by adding it to (or removing it from) the page
 * order. A new section goes just above the first of `before` that is on the
 * page, else at the end. The Sections tab can move it afterwards.
 *
 * The section also switches itself on when its first content is added
 * (`hasContent` going from false to true), so a host who adds a ticket sees
 * it in the preview at once. Switching it off by hand afterwards sticks.
 */
function SectionSwitch({
  section,
  label,
  help,
  before,
  hasContent,
}: {
  section: SectionId
  label: string
  help: string
  before: ReadonlyArray<SectionId>
  hasContent: boolean
}) {
  const { config, set } = useEditor()
  const id = useId()
  const order = config.sectionsOrder
  const toggle = (on: boolean) => {
    if (!on) {
      set(
        ["sectionsOrder"],
        order.filter((s) => s !== section)
      )
      return
    }
    const anchor = before.find((s) => order.includes(s))
    const at = anchor ? order.indexOf(anchor) : order.length
    set(["sectionsOrder"], [...order.slice(0, at), section, ...order.slice(at)])
  }
  const hadContent = useRef(hasContent)
  useEffect(() => {
    const first = hasContent && !hadContent.current
    hadContent.current = hasContent
    if (first && !order.includes(section)) toggle(true)
  })
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>
      </div>
      <Switch
        id={id}
        checked={order.includes(section)}
        onCheckedChange={toggle}
      />
    </div>
  )
}

export function TicketsTab() {
  const { module, config, plan, invitationId } = useEditor()
  const copy = editorCopy(module.meta.category)
  // Read loosely: drafts saved before these fields existed have no such keys.
  const count = (path: Array<string>) =>
    (getIn(config, path) as Array<unknown> | undefined)?.length ?? 0
  const hasTickets =
    count(["admission", "tiers"]) > 0 || !!getIn(config, ["admission", "url"])
  const hasSponsors = count(["sponsors", "items"]) > 0
  return (
    <>
      {plan === "free" && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          Guests see tickets and {copy.sponsor}s on Premium invitations only.
          You can fill them in now; they appear once you{" "}
          <Link
            to="/dashboard/$invitationId/upgrade"
            params={{ invitationId }}
            className="font-medium underline underline-offset-4"
          >
            upgrade
          </Link>
          .
        </p>
      )}
      <Group title="Tickets" description={copy.ticketsDescription}>
        <SectionSwitch
          section="admission"
          label="Show tickets on the invitation"
          help="Appears once there is at least one ticket or a link."
          before={["rsvp", "calendar", "closing"]}
          hasContent={hasTickets}
        />
        <TextField
          path={["admission", "title"]}
          label="Heading"
          optional
          maxLength={80}
          placeholder="Tickets"
        />
        <ListEditor<Tier>
          path={["admission", "tiers"]}
          max={8}
          addLabel="Add ticket"
          itemLabel={(tier, i) => tier.label || `Ticket ${i + 1}`}
          create={() => ({ label: "Standard", price: "Free" })}
        >
          {(_, p) => (
            <>
              <TextField
                path={[...p, "label"]}
                label="Name"
                maxLength={80}
                placeholder={copy.tierPlaceholder}
              />
              <TextField
                path={[...p, "price"]}
                label="Price"
                maxLength={40}
                placeholder="KES 2,500"
                help="Write it as guests should read it, e.g. “KES 2,500”, “$20” or “Free”."
              />
              <TextField
                path={[...p, "note"]}
                label="What it includes"
                optional
                maxLength={200}
                placeholder="Lunch and all sessions"
                className="sm:col-span-2"
              />
            </>
          )}
        </ListEditor>
        <TextField
          path={["admission", "url"]}
          label="Ticket or registration link"
          optional
          type="url"
          placeholder="https://"
          help="Guests see a “Get tickets” button that opens this link."
        />
        <TextField
          path={["admission", "note"]}
          label="Note"
          optional
          multiline
          rows={2}
          maxLength={300}
          placeholder="Pay at the door by M-Pesa. Children under 12 enter free."
        />
      </Group>
      <Group title={copy.sponsorsTitle} description={copy.sponsorsDescription}>
        <SectionSwitch
          section="sponsors"
          label={`Show ${copy.sponsor}s on the invitation`}
          help={`Appears once there is at least one ${copy.sponsor}.`}
          before={["calendar", "closing"]}
          hasContent={hasSponsors}
        />
        <TextField
          path={["sponsors", "title"]}
          label="Heading"
          optional
          maxLength={80}
          placeholder={copy.sponsorsHeadingPlaceholder}
        />
        <ListEditor<Sponsor>
          path={["sponsors", "items"]}
          max={MAX_SPONSORS}
          addLabel={`Add ${copy.sponsor}`}
          itemLabel={(s, i) => s.name || `${capitalise(copy.sponsor)} ${i + 1}`}
          create={() => ({ name: `New ${copy.sponsor}` })}
        >
          {(_, p) => (
            <>
              <TextField path={[...p, "name"]} label="Name" maxLength={120} />
              <TextField
                path={[...p, "url"]}
                label="Website"
                optional
                type="url"
                placeholder="https://"
              />
              <ImageField
                path={[...p, "logo"]}
                purpose="gallery"
                label="Logo"
                help="A PNG with a transparent background looks best."
                className="sm:col-span-2"
              />
            </>
          )}
        </ListEditor>
      </Group>
    </>
  )
}
