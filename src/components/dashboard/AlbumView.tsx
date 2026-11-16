// The host's album page: switches, storage used, guest batches waiting for
// approval, uploading (photos, a folder or a .zip) and the album itself with
// select-and-delete.
import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Check,
  Download,
  ExternalLink,
  LoaderCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { AlbumGrid } from "@/components/album/AlbumGrid"
import { AlbumSettingsForm } from "@/components/album/AlbumSettingsForm"
import { AlbumUploader } from "@/components/album/AlbumUploader"
import { AlbumViewer } from "@/components/album/AlbumViewer"
import { useAlbumItems } from "@/components/album/useAlbumItems"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/album"
import { downloadAll } from "@/lib/album-download"
import { en } from "@/lib/i18n/en"
import {
  decideAlbumBatchFn,
  deleteAlbumItemsFn,
  type getOwnerAlbumFn,
  listOwnerAlbumItemsFn,
} from "@/server/album/album.functions"

type Data = NonNullable<Awaited<ReturnType<typeof getOwnerAlbumFn>>>
type Pending = Data["pending"][number]

const t = en.album
const DELETE_CHUNK = 200

const day = (value: string) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

export function AlbumView({ data }: { data: Data }) {
  const { invitation, usage, pending } = data
  const router = useRouter()
  const [settings, setSettings] = useState(data.settings)
  const live = invitation.status === "published" && !!invitation.slug
  const premium = invitation.albumAvailable

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Event album</p>
          <h1 className="truncate font-display text-3xl sm:text-4xl">
            {invitation.title}
          </h1>
        </div>
        {live && premium && settings.enabled && (
          <Button asChild variant="outline">
            <a
              href={`/i/${invitation.slug}/album`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink aria-hidden="true" /> Open the album
            </a>
          </Button>
        )}
      </div>

      <p className="max-w-2xl text-sm text-muted-foreground">
        One place for every photo and video from the day. You and your guests
        add them; everyone with the link can look through them, and download or
        share them if you allow it.
      </p>

      {!premium ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-4 text-sm">
          <p>The event album is part of Premium.</p>
          <Button asChild>
            <Link
              to="/dashboard/$invitationId/upgrade"
              params={{ invitationId: invitation.id }}
            >
              <Sparkles aria-hidden="true" /> Upgrade to Premium
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {!live && (
            <p className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm">
              Guests can open the album once the invitation is published. You
              can set it up and add photos now.
            </p>
          )}

          <section
            aria-labelledby="album-settings"
            className="flex flex-col gap-4"
          >
            <h2 id="album-settings" className="font-display text-xl">
              Settings
            </h2>
            <AlbumSettingsForm
              invitationId={invitation.id}
              settings={settings}
              onChange={setSettings}
            />
            {data.window && (
              <p className="text-xs text-muted-foreground">
                Guest uploads are open from {day(data.window.from)} to{" "}
                {day(data.window.until)} (
                {data.window.state === "open"
                  ? "open now"
                  : data.window.state === "before"
                    ? "not open yet"
                    : "closed"}
                ). You can add photos at any time.
              </p>
            )}
          </section>

          <Usage usage={usage} />

          {pending.length > 0 && (
            <section
              aria-labelledby="album-pending"
              className="flex flex-col gap-4"
            >
              <h2 id="album-pending" className="font-display text-xl">
                Waiting for your approval
              </h2>
              <p className="-mt-2 text-sm text-muted-foreground">
                Guests sent these in bulk. They stay hidden until you approve
                them, and are deleted after 14 days if you do nothing.
              </p>
              <ul className="flex flex-col gap-3">
                {pending.map((batch) => (
                  <PendingBatch
                    key={batch.id}
                    batch={batch}
                    onDecided={() => void router.invalidate()}
                  />
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="album-add" className="flex flex-col gap-4">
            <h2 id="album-add" className="font-display text-xl">
              Add photos and videos
            </h2>
            <AlbumUploader
              who={{ invitationId: invitation.id }}
              t={t}
              guest={false}
              onUploaded={() => void router.invalidate()}
            />
          </section>

          <Items
            // New uploads and approvals reload the page data: start over.
            key={`${usage.items}-${pending.length}`}
            data={data}
          />
        </>
      )}
    </div>
  )
}

function Usage({ usage }: { usage: Data["usage"] }) {
  const percent = Math.min(100, (usage.bytes / usage.maxBytes) * 100)
  return (
    <section aria-label="Storage used" className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p>
          <span className="font-medium">{usage.items}</span>{" "}
          <span className="text-muted-foreground">
            {usage.items === 1 ? "file" : "files"}
          </span>
        </p>
        <p className="text-muted-foreground">
          {formatBytes(usage.bytes)} of {formatBytes(usage.maxBytes)}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Storage used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max(percent, usage.bytes > 0 ? 1 : 0)}%` }}
        />
      </div>
    </section>
  )
}

function PendingBatch({
  batch,
  onDecided,
}: {
  batch: Pending
  onDecided: () => void
}) {
  const decide = useServerFn(decideAlbumBatchFn)
  const [busy, setBusy] = useState<"approve" | "reject">()

  const run = async (approve: boolean) => {
    if (
      !approve &&
      !window.confirm(
        `Reject and delete ${batch.count} files from ${batch.uploaderName}?`
      )
    ) {
      return
    }
    setBusy(approve ? "approve" : "reject")
    try {
      await decide({ data: { batchId: batch.id, approve } })
      toast(
        approve
          ? `${batch.count} files added to the album`
          : `${batch.count} files rejected`
      )
      onDecided()
    } catch {
      toast.error("Could not save your decision")
      setBusy(undefined)
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          {batch.uploaderName}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {batch.count} files · {formatBytes(batch.bytes)}
            {!batch.finished && " · still uploading"}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(batch.createdAt).toLocaleString("en", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <ul className="grid grid-cols-6 gap-1 sm:grid-cols-12">
        {batch.previews.map((item) => (
          <li
            key={item.id}
            className="aspect-square overflow-hidden rounded-md bg-muted"
          >
            {item.thumbUrl && (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.thumbUrl}
                  alt={`Preview from ${batch.uploaderName}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </a>
            )}
          </li>
        ))}
      </ul>
      {batch.count > batch.previews.length && (
        <p className="text-xs text-muted-foreground">
          Showing {batch.previews.length} of {batch.count}.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!!busy} onClick={() => void run(true)}>
          {busy === "approve" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Check aria-hidden="true" />
          )}
          Approve all {batch.count}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!!busy}
          onClick={() => void run(false)}
        >
          {busy === "reject" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <X aria-hidden="true" />
          )}
          Reject and delete
        </Button>
      </div>
    </li>
  )
}

function Items({ data }: { data: Data }) {
  const { invitation } = data
  const router = useRouter()
  const listItems = useServerFn(listOwnerAlbumItemsFn)
  const deleteItems = useServerFn(deleteAlbumItemsFn)
  const fetchPage = useCallback(
    (offset: number) => listItems({ data: { id: invitation.id, offset } }),
    [listItems, invitation.id]
  )
  const { items, hasMore, loading, load, loadAll, remove } = useAlbumItems(
    fetchPage,
    { items: data.items, nextOffset: data.nextOffset }
  )
  const [open, setOpen] = useState<number | null>(null)
  const [selected, setSelected] = useState<ReadonlySet<string> | null>(null)
  const [busy, setBusy] = useState(false)
  const [zipping, setZipping] = useState<{ done: number; total: number }>()

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const destroy = async (ids: Array<string>) => {
    if (
      ids.length === 0 ||
      !window.confirm(
        `Delete ${ids.length === 1 ? "this file" : `${ids.length} files`} from the album? This cannot be undone.`
      )
    ) {
      return
    }
    setBusy(true)
    try {
      for (let i = 0; i < ids.length; i += DELETE_CHUNK) {
        await deleteItems({
          data: { id: invitation.id, itemIds: ids.slice(i, i + DELETE_CHUNK) },
        })
      }
      remove(ids)
      setSelected(null)
      setOpen(null)
      toast(`${ids.length} deleted`)
      void router.invalidate()
    } catch {
      toast.error("Could not delete")
    } finally {
      setBusy(false)
    }
  }

  const saveAll = async () => {
    setZipping({ done: 0, total: items.length })
    try {
      const all = await loadAll()
      const missed = await downloadAll(all, invitation.title, (done, total) =>
        setZipping({ done, total })
      )
      if (missed > 0) toast.error(t.missed(missed))
    } catch {
      toast.error("Could not prepare the download")
    } finally {
      setZipping(undefined)
    }
  }

  return (
    <section aria-labelledby="album-items" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="album-items" className="font-display text-xl">
          In the album
        </h2>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={busy || selected.size === 0}
                  onClick={() => void destroy([...selected])}
                >
                  {busy ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 aria-hidden="true" />
                  )}
                  Delete {selected.size || ""}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setSelected(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!!zipping}
                  onClick={() => void saveAll()}
                >
                  {zipping ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Download aria-hidden="true" />
                  )}
                  {zipping
                    ? t.preparing(zipping.done, zipping.total)
                    : t.downloadAll}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelected(new Set())}
                >
                  Select
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing in the album yet.
        </p>
      ) : (
        <AlbumGrid
          items={items}
          t={t}
          onOpen={setOpen}
          selected={selected ?? undefined}
          onToggle={toggle}
        />
      )}

      {hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void load("more").catch(() => {})}
          >
            {loading && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {t.loadMore}
          </Button>
        </div>
      )}

      <AlbumViewer
        items={items}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        t={t}
        downloads
        actions={(item) => (
          <button
            type="button"
            aria-label="Delete from the album"
            disabled={busy}
            onClick={() => void destroy([item.id])}
            className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors outline-none hover:bg-red-500/70 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30"
          >
            <Trash2 className="size-5" aria-hidden="true" />
          </button>
        )}
      />
    </section>
  )
}
