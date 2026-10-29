import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Copy,
  LoaderCircle,
  MessageCircle,
  MessageSquareText,
  Plus,
  Trash2,
} from "lucide-react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHydrated } from "@/hooks/use-hydrated"
import {
  addGuestFn,
  type getGuestsFn,
  removeGuestFn,
} from "@/server/invitations/dashboard.functions"
import { copyToClipboard } from "./DashboardShell"

type Data = NonNullable<Awaited<ReturnType<typeof getGuestsFn>>>
type Guest = Data["guests"][number]

const NAME_MAX = 80
const GROUP_MAX = 60

/** `/i/<slug>?to=<token>`: the public page greets the guest by name. */
export function personalLink(origin: string, slug: string, token: string) {
  return `${origin}/i/${slug}?to=${encodeURIComponent(token)}`
}

export function whatsappHref(guestName: string, title: string, link: string) {
  const text = `Hi ${guestName}! You're invited: ${title}\n${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function GuestsView({ data }: { data: Data }) {
  const { invitation, guests } = data
  const live = invitation.status === "published" && !!invitation.slug

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Guest list</p>
          <h1 className="truncate font-display text-3xl sm:text-4xl">
            {invitation.title}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link
            to="/dashboard/$invitationId/responses"
            params={{ invitationId: invitation.id }}
          >
            <MessageSquareText aria-hidden="true" /> Responses
          </Link>
        </Button>
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        Add the people you are inviting. Each guest gets a personal link that
        opens your invitation with their name on the cover.
      </p>

      {!live && (
        <p className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm">
          {invitation.status === "archived"
            ? "This invitation is archived, so personal links do not open. Unarchive it from the dashboard to share them again."
            : "Personal links work once the invitation is published. You can build your list now and share the links after publishing."}
          {invitation.status === "draft" && (
            <>
              {" "}
              <Link
                to="/editor/$invitationId"
                params={{ invitationId: invitation.id }}
                className="text-primary underline-offset-4 hover:underline"
              >
                Open the editor
              </Link>
            </>
          )}
        </p>
      )}

      <AddGuestForm invitationId={invitation.id} />

      {guests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No guests yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {guests.map((guest) => (
            <GuestRow
              key={guest.id}
              guest={guest}
              slug={live ? invitation.slug : null}
              title={invitation.title}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function AddGuestForm({ invitationId }: { invitationId: string }) {
  const add = useServerFn(addGuestFn)
  const router = useRouter()
  const [name, setName] = useState("")
  const [group, setGroup] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    try {
      await add({
        data: {
          invitationId,
          name: name.trim(),
          group: group.trim() || undefined,
        },
      })
      setName("")
      await router.invalidate()
      toast(`${name.trim()} added`)
    } catch {
      toast.error("Could not add the guest")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="guest-name">Name</Label>
        <Input
          id="guest-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
          required
          autoComplete="off"
          placeholder="Aunt Mary & Uncle Joe"
        />
      </div>
      <div className="flex flex-col gap-1.5 sm:w-56">
        <Label htmlFor="guest-group">Group (optional)</Label>
        <Input
          id="guest-group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          maxLength={GROUP_MAX}
          autoComplete="off"
          placeholder="Family"
        />
      </div>
      <Button type="submit" size="lg" disabled={busy || !name.trim()}>
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Plus aria-hidden="true" />
        )}
        Add guest
      </Button>
    </form>
  )
}

function GuestRow({
  guest,
  slug,
  title,
}: {
  guest: Guest
  slug: string | null
  title: string
}) {
  const remove = useServerFn(removeGuestFn)
  const router = useRouter()
  const hydrated = useHydrated()
  const [busy, setBusy] = useState(false)
  const link =
    slug && hydrated
      ? personalLink(window.location.origin, slug, guest.slugToken)
      : slug
        ? personalLink("", slug, guest.slugToken)
        : null

  const onRemove = async () => {
    setBusy(true)
    try {
      await remove({ data: { guestId: guest.id } })
      await router.invalidate()
      toast(`${guest.name} removed`)
    } catch {
      toast.error("Could not remove the guest")
      setBusy(false)
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {guest.name}
          {guest.group && (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {guest.group}
            </span>
          )}
        </p>
        {link && (
          <code className="mt-1 block truncate text-xs text-muted-foreground">
            {link}
          </code>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {link && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyToClipboard(link)}
            >
              <Copy aria-hidden="true" /> Copy link
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={whatsappHref(guest.name, title, link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden="true" /> Send on WhatsApp
              </a>
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void onRemove()}
          disabled={busy}
          aria-label={`Remove ${guest.name}`}
        >
          {busy ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 aria-hidden="true" />
          )}
          <span className="sm:sr-only">Remove</span>
        </Button>
      </div>
    </li>
  )
}
