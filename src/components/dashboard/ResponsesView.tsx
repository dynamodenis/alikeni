import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Download, ExternalLink, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  type getResponsesFn,
  setWishApprovedFn,
} from "@/server/invitations/dashboard.functions"
import { RsvpTable } from "./RsvpTable"

type Data = NonNullable<Awaited<ReturnType<typeof getResponsesFn>>>
type WishItem = Data["wishes"][number]

const wishDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function ResponsesView({ data }: { data: Data }) {
  const { invitation, totals, rsvps, wishes } = data
  const live = invitation.status === "published" && invitation.slug

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Responses</p>
          <h1 className="truncate font-display text-3xl sm:text-4xl">
            {invitation.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link
              to="/dashboard/$invitationId/guests"
              params={{ invitationId: invitation.id }}
            >
              <Users aria-hidden="true" /> Guests
            </Link>
          </Button>
          {live && (
            <Button asChild variant="outline">
              <a href={`/i/${invitation.slug}`} target="_blank" rel="noopener">
                <ExternalLink aria-hidden="true" /> View live
              </a>
            </Button>
          )}
          <Button asChild>
            <a href={`/api/export/${invitation.id}.csv`} download>
              <Download aria-hidden="true" /> Download CSV
            </a>
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Total label="Attending" value={totals.yes} />
        <Total label="Maybe" value={totals.maybe} />
        <Total label="Not attending" value={totals.no} />
        <Total label="Headcount" value={totals.headcount} accent />
      </dl>

      <section aria-labelledby="rsvps-title" className="flex flex-col gap-3">
        <h2 id="rsvps-title" className="font-display text-2xl">
          RSVPs <span className="text-muted-foreground">({rsvps.length})</span>
        </h2>
        <RsvpTable data={rsvps} />
      </section>

      <section aria-labelledby="wishes-title" className="flex flex-col gap-3">
        <div>
          <h2 id="wishes-title" className="font-display text-2xl">
            Wishes{" "}
            <span className="text-muted-foreground">({wishes.length})</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Wishes show on your page right away. Switch one off to hide it.
          </p>
        </div>
        {wishes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No wishes yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wishes.map((wish) => (
              <WishRow key={wish.id} wish={wish} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Total({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div
      className={
        accent
          ? "rounded-xl border border-primary/40 bg-primary/10 p-4"
          : "rounded-xl border border-border bg-card p-4"
      }
    >
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function WishRow({ wish }: { wish: WishItem }) {
  const setApproved = useServerFn(setWishApprovedFn)
  const router = useRouter()
  // Optimistic: flip now, roll back on failure.
  const [approved, setLocal] = useState(wish.approved)
  const [busy, setBusy] = useState(false)
  const switchId = `wish-${wish.id}`

  const toggle = async (next: boolean) => {
    setLocal(next)
    setBusy(true)
    try {
      await setApproved({ data: { wishId: wish.id, approved: next } })
      toast(next ? "Wish visible" : "Wish hidden")
      void router.invalidate()
    } catch {
      setLocal(!next)
      toast.error("Could not update the wish")
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{wish.name}</span>
          <span className="text-muted-foreground">
            {" "}
            · {wishDate.format(new Date(wish.createdAt))}
          </span>
        </p>
        <p
          className={
            approved
              ? "mt-1 text-sm break-words whitespace-pre-line"
              : "mt-1 text-sm break-words whitespace-pre-line text-muted-foreground line-through"
          }
        >
          {wish.message}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <label htmlFor={switchId} className="text-xs text-muted-foreground">
          {approved ? "Visible" : "Hidden"}
        </label>
        <Switch
          id={switchId}
          checked={approved}
          disabled={busy}
          onCheckedChange={(next) => void toggle(next)}
        />
      </div>
    </li>
  )
}
