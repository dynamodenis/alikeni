// Pick → preview → upload, for the host (dashboard) and for guests (album
// page). Photos, a whole folder or a .zip all end up as the same list of
// files, checked in the browser and shown before anything is sent.
import {
  FileArchive,
  FolderOpen,
  ImagePlus,
  LoaderCircle,
  Video,
} from "lucide-react"
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
            {item.kind === "image" ? (
              <LocalImage file={item.file} />
            ) : (
              <span className="grid h-full w-full place-items-center text-muted-foreground">
                <Video className="size-5" aria-hidden="true" />
                <span className="sr-only">{item.file.name}</span>
              </span>
            )}
          </li>
        ))}
        {files.length > shown.length && (
          <li className="grid aspect-square place-items-center rounded-md bg-muted text-xs text-muted-foreground">
            {t.more(files.length - shown.length)}
          </li>
        )}
      </ul>
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
 * A photo straight from the device. The object URL is made when the image
 * mounts and released when it leaves, so nothing outlives the preview.
 */
function LocalImage({ file }: { file: File }) {
  const attach = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return
      const url = URL.createObjectURL(file)
      image.src = url
      return () => URL.revokeObjectURL(url)
    },
    [file]
  )
  return (
    <img
      ref={attach}
      alt={file.name}
      decoding="async"
      className="h-full w-full object-cover"
    />
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
