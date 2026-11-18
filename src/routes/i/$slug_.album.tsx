import { BrandLoader } from "@/components/brand/Loader"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { ArrowLeft, Download, LoaderCircle, Lock } from "lucide-react"
import { useCallback, useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { AlbumGrid } from "@/components/album/AlbumGrid"
import { AlbumUploader } from "@/components/album/AlbumUploader"
import { AlbumViewer } from "@/components/album/AlbumViewer"
import { useAlbumItems } from "@/components/album/useAlbumItems"
import { Logo } from "@/components/landing/Nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useHydrated } from "@/hooks/use-hydrated"
import { downloadAll, downloadSome } from "@/lib/album-download"
import { formatLongDate } from "@/lib/format-date"
import { INTL_LOCALE, getMessages } from "@/lib/i18n"
import {
  getPublicAlbumFn,
  listAlbumItemsFn,
  unlockAlbumFn,
} from "@/server/album/album.functions"

/**
 * The event album, `/i/<slug>/album`: every photo and video the host and
 * guests added (`src/server/album`). Premium invitations with the album
 * switched on; 404 otherwise.
 *
 * - With a PIN, nothing is listed until it is entered; the access key it
 *   returns is kept in this browser and stops working when the host changes
 *   the PIN.
 * - Guests may upload during the event window; more than 20 files at once
 *   wait for the host's approval.
 * - `noindex`: an album is for the people it was shared with.
 */
export const Route = createFileRoute("/i/$slug_/album")({
  loader: async ({ params }) => {
    const album = await getPublicAlbumFn({ data: { slug: params.slug } })
    if (!album) throw notFound()
    return album
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Album · ${loaderData.title}` : "Album" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AlbumPage,
})

const accessKey = (slug: string) => `alikeni:album:access:${slug}`

function readAccess(slug: string): string | undefined {
  try {
    return localStorage.getItem(accessKey(slug)) ?? undefined
  } catch {
    return undefined
  }
}

function AlbumPage() {
  const album = Route.useLoaderData()
  const t = getMessages(album.locale).album
  const hydrated = useHydrated()
  // What this visit changed (a PIN entered, or a stale key dropped); until
  // then the key this browser stored earlier. Read only after hydration: the
  // server cannot know what the browser holds.
  const [changed, setAccess] = useState<string | null>()
  const access =
    changed === undefined
      ? hydrated
        ? readAccess(album.slug)
        : undefined
      : (changed ?? undefined)

  const locked = album.pinRequired && !access
  const forget = useCallback(() => {
    try {
      localStorage.removeItem(accessKey(album.slug))
    } catch {
      // Nothing stored, nothing to remove.
    }
    setAccess(null)
  }, [album.slug])

  return (
    <main
      lang={INTL_LOCALE[album.locale]}
      className="theme-alikeni grain min-h-svh bg-background text-foreground"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Logo />
            <Link
              to="/i/$slug"
              params={{ slug: album.slug }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t.back}
            </Link>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t.eyebrow}</p>
            <h1 className="font-display text-3xl text-balance sm:text-4xl">
              {album.title}
            </h1>
          </div>
        </header>

        {!hydrated ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          </p>
        ) : locked ? (
          <PinGate
            slug={album.slug}
            t={t}
            onUnlocked={(key) => {
              try {
                localStorage.setItem(accessKey(album.slug), key)
              } catch {
                // Private mode: the PIN is asked again on the next visit.
              }
              setAccess(key)
            }}
          />
        ) : (
          <AlbumBody
            key={access ?? "open"}
            album={album}
            access={access}
            onLocked={forget}
          />
        )}
      </div>
    </main>
  )
}

function PinGate({
  slug,
  t,
  onUnlocked,
}: {
  slug: string
  t: ReturnType<typeof getMessages>["album"]
  onUnlocked: (access: string) => void
}) {
  const [pin, setPin] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      const result = await unlockAlbumFn({ data: { slug, pin } })
      if (result.access) onUnlocked(result.access)
      else window.location.reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : undefined)
      setPin("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <Lock className="size-6 text-primary" aria-hidden="true" />
      <div>
        <h2 className="font-display text-2xl">{t.pinTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.pinBody}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="album-pin">{t.pinLabel}</Label>
        <Input
          id="album-pin"
          value={pin}
          onChange={(event) =>
            setPin(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
          inputMode="numeric"
          autoComplete="off"
          required
          minLength={4}
          aria-invalid={!!error}
          aria-describedby={error ? "album-pin-error" : undefined}
          className="text-lg tracking-[0.4em]"
        />
        {error && (
          <p
            id="album-pin-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" disabled={busy || pin.length < 4}>
        {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}
        {t.pinSubmit}
      </Button>
    </form>
  )
}

type Album = ReturnType<typeof Route.useLoaderData>

function AlbumBody({
  album,
  access,
  onLocked,
}: {
  album: Album
  access: string | undefined
  /** The stored access key no longer works (the host changed the PIN). */
  onLocked: () => void
}) {
  const t = getMessages(album.locale).album
  const [count, setCount] = useState<number | null>(album.count)
  const [open, setOpen] = useState<number | null>(null)
  const [zipping, setZipping] = useState<{ done: number; total: number }>()
  /** null: tiles open the viewer. A set: tiles are being picked. */
  const [selected, setSelected] = useState<ReadonlySet<string> | null>(null)

  const fetchPage = useCallback(
    async (offset: number) => {
      const page = await listAlbumItemsFn({
        data: { slug: album.slug, access, offset },
      })
      setCount(page.count)
      return page
    },
    [album.slug, access]
  )
  const { items, hasMore, loading, error, load, loadAll } =
    useAlbumItems(fetchPage)

  const loadOrLock = useCallback(
    async (mode: "more" | "reload") => {
      try {
        await load(mode)
      } catch (cause) {
        // A stale key gets the same refusal as no key: ask for the PIN again.
        if (
          album.pinRequired &&
          cause instanceof Error &&
          /PIN/.test(cause.message)
        ) {
          onLocked()
        }
      }
    },
    [album.pinRequired, load, onLocked]
  )
  useEffect(() => {
    void loadOrLock("reload")
  }, [loadOrLock])

  const saveAll = async () => {
    setZipping({ done: 0, total: count ?? items.length })
    try {
      const all = await loadAll()
      const missed = await downloadAll(all, album.title, (done, total) =>
        setZipping({ done, total })
      )
      if (missed > 0) toast.error(t.missed(missed))
    } catch {
      toast.error(t.loadFailed)
    } finally {
      setZipping(undefined)
    }
  }

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const selectAll = async () => {
    try {
      const all = await loadAll()
      setSelected(new Set(all.map((item) => item.id)))
    } catch {
      toast.error(t.loadFailed)
    }
  }

  const saveSelected = async () => {
    const chosen = items.filter((item) => selected?.has(item.id))
    if (chosen.length === 0) return
    setZipping({ done: 0, total: chosen.length })
    try {
      const missed = await downloadSome(chosen, album.title, (done, total) =>
        setZipping({ done, total })
      )
      if (missed > 0) toast.error(t.missed(missed))
      setSelected(null)
    } catch {
      toast.error(t.loadFailed)
    } finally {
      setZipping(undefined)
    }
  }

  const longDay = (day: string) =>
    formatLongDate(`${day}T12:00:00Z`, "UTC", album.locale)
  const uploadNote =
    album.uploads === "open" ? t.until(longDay(album.uploadUntil)) : null
  // Why there is no upload box, said where the box would be.
  const uploadsShut =
    album.uploads === "before"
      ? t.notYet(longDay(album.uploadFrom))
      : album.uploads === "closed"
        ? t.closed
        : null

  return (
    <>
      {album.uploads === "open" && (
        <AlbumUploader
          who={{ slug: album.slug, access }}
          t={t}
          guest
          onUploaded={(result) => {
            if (!result.needsApproval) void loadOrLock("reload")
          }}
        />
      )}

      {uploadsShut && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-sm"
        >
          <p className="font-medium">{uploadsShut}</p>
          <p className="text-muted-foreground">
            {t.hostHint}{" "}
            <Link
              to="/dashboard"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {t.hostLink}
            </Link>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selected ? (
            t.selectHint
          ) : (
            <>
              {count !== null && count > 0 && <>{t.count(count)} · </>}
              {uploadNote}
            </>
          )}
        </p>
        {album.downloads && items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected ? (
              <>
                <Button
                  type="button"
                  disabled={!!zipping || selected.size === 0}
                  onClick={() => void saveSelected()}
                >
                  {zipping ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Download aria-hidden="true" />
                  )}
                  {zipping
                    ? t.preparing(zipping.done, zipping.total)
                    : t.downloadSome(selected.size)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!!zipping || loading}
                  onClick={() => void selectAll()}
                >
                  {t.selectAll}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!!zipping}
                  onClick={() => setSelected(null)}
                >
                  {t.cancel}
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
                  disabled={!!zipping}
                  onClick={() => setSelected(new Set())}
                >
                  {t.select}
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <AlbumGrid
          items={items}
          t={t}
          onOpen={setOpen}
          selected={selected ?? undefined}
          onToggle={toggle}
        />
      ) : loading ? (
        <div className="flex justify-center py-16">
          <BrandLoader />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{t.loadFailed}</p>
          <Button variant="outline" onClick={() => void loadOrLock("reload")}>
            {t.retry}
          </Button>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border px-4 py-16 text-center text-sm text-muted-foreground">
          {t.empty}
          {album.uploads === "open" && ` ${t.emptyOpen}`}
        </p>
      )}

      {hasMore && items.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={() => void loadOrLock("more")}
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
        downloads={album.downloads}
      />
    </>
  )
}
