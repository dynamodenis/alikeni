import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Archive,
  ArchiveRestore,
  CopyPlus,
  ExternalLink,
  Eye,
  Heart,
  Link2,
  LoaderCircle,
  MessageSquareText,
  MoreHorizontal,
  PencilLine,
  Trash2,
  Users,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  deleteInvitationFn,
  duplicateInvitationFn,
  setArchivedFn,
} from "@/server/invitations/dashboard.functions"
import type { listMyInvitationsFn } from "@/server/invitations/invitations.functions"
import { getTemplateMeta } from "@/templates/registry"
import { copyToClipboard } from "./DashboardShell"

export type DashboardRow = Awaited<
  ReturnType<typeof listMyInvitationsFn>
>[number]

const updated = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const STATUS = {
  published: { label: "Live", className: "bg-emerald-400/90 text-emerald-950" },
  draft: { label: "Draft", className: "bg-background/85 text-foreground" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
} as const

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again."

export function InvitationCard({ row }: { row: DashboardRow }) {
  const meta = getTemplateMeta(row.templateId)
  const router = useRouter()
  const duplicate = useServerFn(duplicateInvitationFn)
  const archive = useServerFn(setArchivedFn)
  const remove = useServerFn(deleteInvitationFn)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const live = row.status === "published" && !!row.slug
  const archived = row.status === "archived"
  const status = STATUS[live ? "published" : archived ? "archived" : "draft"]
  const { stats } = row

  const run = async (action: () => Promise<string>, failure: string) => {
    setBusy(true)
    try {
      const message = await action()
      await router.invalidate()
      toast(message)
    } catch (error) {
      toast.error(failure, { description: errorText(error) })
    } finally {
      setBusy(false)
    }
  }

  const onDuplicate = () =>
    run(async () => {
      await duplicate({ data: { id: row.id } })
      return "Copy created"
    }, "Could not duplicate")

  const onArchive = () =>
    run(async () => {
      const result = await archive({
        data: { id: row.id, archived: !archived },
      })
      return result.status === "archived"
        ? "Archived. The public page is hidden."
        : result.status === "published"
          ? "Restored. The page is live again."
          : "Restored as a draft."
    }, "Could not update")

  const onDelete = () =>
    run(async () => {
      await remove({ data: { id: row.id } })
      setConfirmDelete(false)
      return "Invitation deleted"
    }, "Could not delete")

  return (
    <li
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40",
        archived && "opacity-80"
      )}
    >
      <Link
        to="/editor/$invitationId"
        params={{ invitationId: row.id }}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
      >
        {/* Name = "Edit <title>, <status>" so it includes the visible badge. */}
        <span className="sr-only">Edit {row.title}, </span>
        {meta && (
          <img
            src={meta.thumbnail}
            alt=""
            loading="lazy"
            className={cn(
              "size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]",
              archived && "grayscale"
            )}
          />
        )}
        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate font-display text-xl">{row.title}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.title}`}
                disabled={busy}
                className="-mt-0.5 -mr-1.5 shrink-0"
              >
                {busy ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <MoreHorizontal aria-hidden="true" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  to="/editor/$invitationId"
                  params={{ invitationId: row.id }}
                >
                  <PencilLine aria-hidden="true" /> Edit
                </Link>
              </DropdownMenuItem>
              {live && (
                <>
                  <DropdownMenuItem asChild>
                    <a href={`/i/${row.slug}`} target="_blank" rel="noopener">
                      <ExternalLink aria-hidden="true" /> View live
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      void copyToClipboard(
                        `${window.location.origin}/i/${row.slug}`
                      )
                    }
                  >
                    <Link2 aria-hidden="true" /> Copy link
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  to="/dashboard/$invitationId/responses"
                  params={{ invitationId: row.id }}
                >
                  <MessageSquareText aria-hidden="true" /> Responses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/dashboard/$invitationId/guests"
                  params={{ invitationId: row.id }}
                >
                  <Users aria-hidden="true" /> Guests
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void onDuplicate()}>
                <CopyPlus aria-hidden="true" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void onArchive()}>
                {archived ? (
                  <>
                    <ArchiveRestore aria-hidden="true" /> Unarchive
                  </>
                ) : (
                  <>
                    <Archive aria-hidden="true" /> Archive
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setConfirmDelete(true)}
              >
                <Trash2 aria-hidden="true" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground">
          {meta?.name ?? row.templateId} · edited{" "}
          {updated.format(new Date(row.updatedAt))}
        </p>
        {live && (
          <p className="truncate text-xs text-muted-foreground">
            /i/{row.slug}
          </p>
        )}

        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat icon={Eye} label="7-day views" value={stats.views7d} />
          <Stat
            icon={MessageSquareText}
            label="Responses"
            value={stats.responses}
            hint={`${stats.headcount} attending`}
          />
          <Stat icon={Heart} label="Wishes" value={stats.wishes} />
        </dl>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/editor/$invitationId"
            params={{ invitationId: row.id }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/85"
          >
            <PencilLine className="size-3.5" aria-hidden="true" />
            Edit
          </Link>
          <Link
            to="/dashboard/$invitationId/responses"
            params={{ invitationId: row.id }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-muted"
          >
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            Responses
          </Link>
          {live && (
            <a
              href={`/i/${row.slug}`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View live
            </a>
          )}
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="theme-festly">
          <DialogHeader>
            <DialogTitle>Delete “{row.title}”?</DialogTitle>
            <DialogDescription>
              This removes the invitation, its public page, all RSVPs, wishes,
              guest links and view counts. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onDelete()}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 aria-hidden="true" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Eye
  label: string
  value: number
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-muted/50 px-1 py-2">
      <dt className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
        <Icon className="size-3" aria-hidden="true" />
        {label}
      </dt>
      <dd className="text-lg leading-tight font-semibold tabular-nums">
        {value}
      </dd>
      {hint && <dd className="text-[0.7rem] text-muted-foreground">{hint}</dd>}
    </div>
  )
}
