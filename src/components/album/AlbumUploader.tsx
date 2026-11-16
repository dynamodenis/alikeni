// Pick → preview → upload, for the host (dashboard) and for guests (album
// page). Photos, a whole folder or a .zip all end up as the same list of
// files, checked in the browser and shown before anything is sent.
import {
  FileArchive,
  FolderOpen,
  ImagePlus,
  LoaderCircle,
  Play,
  Video,
  X,
} from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTurnstile } from "@/components/turnstile/useTurnstile"
import { BULK_THRESHOLD, formatBytes } from "@/lib/album"
import {
  gatherAlbumFiles,
  type AlbumFile,
  type SkippedFile,
} from "@/lib/album-files"
import {
  uploadAlbumBatch,
  type AlbumUploader as Who,
  type BatchProgress,
  type BatchResult,
} from "@/lib/album-upload"
import { guestDeviceId } from "@/lib/guest-device"
import type { Messages } from "@/lib/i18n"

type Stage =
  | { name: "idle" }
  | { name: "reading"; found: number }
  | { name: "review"; files: Array<AlbumFile>; skipped: Array<SkippedFile> }
  | { name: "uploading"; progress: BatchProgress }
  | { name: "done"; result: BatchResult }

const PREVIEWS = 18
const NAME_KEY = "alikeni:album:name"

const savedName = () => {
  try {
    return localStorage.getItem(NAME_KEY) ?? ""
  } catch {
    return ""
  }
}

export function AlbumUploader({
  who,
  t,
  guest,
  onUploaded,
}: {
  who: Who
  t: Messages["album"]
  /** Guests give a name, pass the human check and may need approval. */
  guest: boolean
  onUploaded: (result: BatchResult) => void
}) {
  const [stage, setStage] = useState<Stage>({ name: "idle" })
  const [error, setError] = useState<string>()
  const [name, setName] = useState("")
  const turnstile = useTurnstile(guest)
  const files = useRef<HTMLInputElement>(null)
  const folder = useRef<HTMLInputElement>(null)
  const zip = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (guest) setName(savedName())
  }, [guest])

  // Warn before leaving mid-upload: the files travel from this page.
  useEffect(() => {
    if (stage.name !== "uploading") return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [stage.name])

  const pick = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    setError(undefined)
    setStage({ name: "reading", found: 0 })
    try {
      const gathered = await gatherAlbumFiles(Array.from(list), (found) =>
        setStage({ name: "reading", found })
      )
      setStage({ name: "review", ...gathered })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.uploadFailed)
      setStage({ name: "idle" })
    }
  }

  const send = async (chosen: Array<AlbumFile>) => {
    setError(undefined)
    setStage({
      name: "uploading",
      progress: { done: 0, total: chosen.length, percent: 0 },
    })
    try {
      if (guest) {
        try {
          localStorage.setItem(NAME_KEY, name.trim())
        } catch {
          // Private mode: the name is simply asked again next time.
        }
      }
      const result = await uploadAlbumBatch({
        who,
        name: name.trim(),
        files: chosen,
        device: guest ? guestDeviceId() : undefined,
        turnstileToken: turnstile.token,
        onProgress: (progress) => setStage({ name: "uploading", progress }),
      })
      setStage({ name: "done", result })
      onUploaded(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.uploadFailed)
      setStage({ name: "review", files: chosen, skipped: [] })
    } finally {
      if (turnstile.enabled) turnstile.reset()
    }
  }

  const reset = () => {
    setStage({ name: "idle" })
    setError(undefined)
  }

  const input = (
    ref: React.RefObject<HTMLInputElement | null>,
    props: React.ComponentProps<"input">
  ) => (
    <input
      ref={ref}
      type="file"
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        void pick(event.target.files)
        event.target.value = ""
      }}
      {...props}
    />
  )

  return (
    <section
      aria-label={t.add}
      className="rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      {input(files, {
        multiple: true,
        accept:
          "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime,video/webm",
      })}
      {input(folder, {
        multiple: true,
        // Non-standard but supported by every desktop browser.
        ...({ webkitdirectory: "" } as object),
      })}
      {input(zip, { accept: ".zip,application/zip" })}

      {stage.name === "idle" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="lg"
              onClick={() => files.current?.click()}
            >
              <ImagePlus aria-hidden="true" /> {t.choose}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => folder.current?.click()}
            >
              <FolderOpen aria-hidden="true" /> {t.folder}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => zip.current?.click()}
            >
              <FileArchive aria-hidden="true" /> {t.zip}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t.limits}
            {guest && ` ${t.approval(BULK_THRESHOLD)}`}
          </p>
        </div>
      )}

      {stage.name === "reading" && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          {t.reading(stage.found)}
        </p>
      )}

      {stage.name === "review" && (
        <Review
          t={t}
          files={stage.files}
          skipped={stage.skipped}
          guest={guest}
          name={name}
          onName={setName}
          widget={turnstile.widget}
          waiting={turnstile.enabled && !turnstile.token}
          onCancel={reset}
          onSend={() => void send(stage.files)}
        />
      )}

      {stage.name === "uploading" && (
        <div role="status" className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            {t.uploading(
              Math.min(stage.progress.done + 1, stage.progress.total),
              stage.progress.total
            )}
          </p>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stage.progress.percent}
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${stage.progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t.keepOpen}</p>
        </div>
      )}

      {stage.name === "done" && (
        <div className="flex flex-col gap-3">
          <p role="status" className="text-sm font-medium">
            {stage.result.needsApproval
              ? t.sentForApproval(stage.result.uploaded)
              : t.done(stage.result.uploaded)}
          </p>
          {stage.result.failed.length > 0 && (
            <FileNotes
              summary={t.failed(stage.result.failed.length)}
              items={stage.result.failed}
            />
          )}
          <div>
            <Button type="button" variant="outline" onClick={reset}>
              {t.again}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  )
}

function Review({
  t,
  files,
  skipped,
  guest,
  name,
  onName,
  widget,
  waiting,
  onCancel,
  onSend,
}: {
  t: Messages["album"]
  files: Array<AlbumFile>
  skipped: Array<SkippedFile>
  guest: boolean
  name: string
  onName: (value: string) => void
  widget: React.ReactNode
  waiting: boolean
  onCancel: () => void
  onSend: () => void
}) {
  const shown = files.slice(0, PREVIEWS)
  const [open, setOpen] = useState<AlbumFile>()
  const bytes = files.reduce((sum, item) => sum + item.file.size, 0)

  if (files.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">{t.nothing}</p>
        {skipped.length > 0 && (
          <FileNotes summary={t.skipped(skipped.length)} items={skipped} />
        )}
        <div>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.cancel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
    >
      <p className="text-sm font-medium">
        {t.ready(files.length)}{" "}
        <span className="font-normal text-muted-foreground">
          · {formatBytes(bytes)}
        </span>
      </p>
      <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-9">
        {shown.map((item, index) => (
          <li
            key={`${item.file.name}-${index}`}
            className="relative aspect-square overflow-hidden rounded-md bg-muted"
          >
            <button
              type="button"
              aria-label={t.preview(item.file.name)}
              onClick={() => setOpen(item)}
              className="group relative block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              {item.kind === "image" ? (
                <LocalImage file={item.file} />
              ) : (
                <>
                  {/* Behind the frame: what shows when the browser cannot
                      decode this video (it still uploads). */}
                  <span className="absolute inset-0 grid place-items-center text-muted-foreground">
                    <Video className="size-5" aria-hidden="true" />
                  </span>
                  <LocalVideo
                    file={item.file}
                    className="relative h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-8 place-items-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-110">
                      <Play
                        className="size-4 fill-current"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
        {files.length > shown.length && (
          <li className="grid aspect-square place-items-center rounded-md bg-muted text-xs text-muted-foreground">
            {t.more(files.length - shown.length)}
          </li>
        )}
      </ul>
      <LocalPreview item={open} onClose={() => setOpen(undefined)} t={t} />
      {skipped.length > 0 && (
        <FileNotes summary={t.skipped(skipped.length)} items={skipped} />
      )}
      {guest && files.length > BULK_THRESHOLD && (
        <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm">
          {t.approval(BULK_THRESHOLD)}
        </p>
      )}
      {guest && (
        <div className="flex max-w-xs flex-col gap-1.5">
          <Label htmlFor="album-name">{t.name}</Label>
          <Input
            id="album-name"
            value={name}
            onChange={(event) => onName(event.target.value)}
            maxLength={60}
            required
            autoComplete="name"
          />
        </div>
      )}
      {widget}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="lg" disabled={waiting}>
          {t.send(files.length)}
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={onCancel}>
          {t.cancel}
        </Button>
      </div>
    </form>
  )
}

/**
 * A photo or video straight from the device. The object URL is made when
 * the element mounts and released when it leaves, so nothing outlives the
 * preview. `fragment` is added to the URL (`#t=…` picks the video frame).
 */
function useLocalFile(file: File, fragment = "") {
  return useCallback(
    (element: HTMLImageElement | HTMLVideoElement | null) => {
      if (!element) return
      const url = URL.createObjectURL(file)
      element.src = `${url}${fragment}`
      return () => URL.revokeObjectURL(url)
    },
    [file, fragment]
  )
}

function LocalImage({
  file,
  className = "h-full w-full object-cover",
}: {
  file: File
  className?: string
}) {
  const attach = useLocalFile(file)
  return (
    <img ref={attach} alt={file.name} decoding="async" className={className} />
  )
}

/** Without `controls`: a still frame from just after the start. */
function LocalVideo({
  file,
  controls = false,
  className,
}: {
  file: File
  controls?: boolean
  className?: string
}) {
  const attach = useLocalFile(file, controls ? "" : "#t=0.1")
  return (
    // People's own clips: there are no captions to offer.
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={attach}
      controls={controls}
      autoPlay={controls}
      muted={!controls}
      playsInline
      preload="metadata"
      tabIndex={controls ? undefined : -1}
      className={className}
    />
  )
}

/** One chosen file, large: the photo, or the video with a player. */
function LocalPreview({
  item,
  onClose,
  t,
}: {
  item: AlbumFile | undefined
  onClose: () => void
  t: Messages["album"]
}) {
  return (
    <DialogPrimitive.Root
      open={!!item}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col outline-none"
        >
          {item && (
            <>
              <div className="flex items-center justify-between gap-3 p-3 text-white">
                <DialogPrimitive.Title className="min-w-0 truncate text-sm text-white/80">
                  {item.file.name}
                  <span className="ml-2 text-white/50">
                    {formatBytes(item.file.size)}
                  </span>
                </DialogPrimitive.Title>
                <DialogPrimitive.Close
                  aria-label={t.close}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X className="size-5" aria-hidden="true" />
                </DialogPrimitive.Close>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center px-2 pb-4">
                {item.kind === "video" ? (
                  <LocalVideo
                    file={item.file}
                    controls
                    className="max-h-full max-w-full rounded-md"
                  />
                ) : (
                  <LocalImage
                    file={item.file}
                    className="max-h-full max-w-full rounded-md object-contain"
                  />
                )}
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function FileNotes({
  summary,
  items,
}: {
  summary: string
  items: Array<{ name: string; reason: string }>
}) {
  return (
    <details className="text-sm text-muted-foreground">
      <summary className="cursor-pointer">{summary}</summary>
      <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto text-xs">
        {items.slice(0, 100).map((item, index) => (
          <li key={`${item.name}-${index}`} className="break-all">
            {item.name}: {item.reason}
          </li>
        ))}
      </ul>
    </details>
  )
}
