import { ClientOnly } from "@tanstack/react-router"
import { ChevronDown, ChevronUp, Music2, Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../../context"
import type { MusicSource } from "../../schema"
import { loadWidgetApi, widgetSrc, type SCWidget } from "./soundcloud-widget"

type SoundCloudSource = Extract<MusicSource, { kind: "soundcloud" }>
type Props = { source: SoundCloudSource; startAt: number; loop: boolean }

/** How long to wait for the widget to report PLAY before asking for a tap. */
const START_GRACE_MS = 1500

/**
 * Music from SoundCloud. What guests normally see is a small, quiet pill in
 * the corner: play/pause, the track title and "SoundCloud". SoundCloud's own
 * widget does the playing and opens from the pill; minimizing it again does
 * not stop the music (only pause does).
 *
 * - On the public page the widget (over 1 MB of script, plus SoundCloud's
 *   cookie) is not loaded until the guest first touches the page, so it
 *   costs nothing while the cover is up; a play asked for meanwhile runs as
 *   soon as it is ready.
 * - The cover tap asks it to play. iOS Safari will not pass that tap into
 *   the cross-origin iframe, so when no PLAY arrives after a short grace
 *   period the widget opens and asks the guest to tap ▶ themselves, then
 *   folds away again once the music is on.
 */
function Dock({ source, startAt, loop }: Props) {
  const { mode, opened, registerMusic, palette, t } = useInvitation()
  const frame = useRef<HTMLIFrameElement>(null)
  const widget = useRef<SCWidget | null>(null)
  const pendingStart = useRef(false)
  const graceTimer = useRef<number | undefined>(undefined)
  const [playing, setPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  /** The widget opened by itself to ask for a tap, not because of the guest. */
  const openedForTap = useRef(false)
  const [src] = useState(() => widgetSrc(source.trackId, palette.primary))
  const [armed, setArmed] = useState(mode !== "public")

  useEffect(() => {
    if (armed) return
    const arm = () => setArmed(true)
    const events = ["pointerdown", "keydown", "touchstart"] as const
    for (const event of events) {
      window.addEventListener(event, arm, { once: true, passive: true })
    }
    return () => {
      for (const event of events) window.removeEventListener(event, arm)
    }
  }, [armed])

  const startGrace = () => {
    window.clearTimeout(graceTimer.current)
    graceTimer.current = window.setTimeout(() => {
      setNeedsTap(true)
      setCollapsed((current) => {
        if (current) openedForTap.current = true
        return false
      })
    }, START_GRACE_MS)
  }

  useEffect(() => {
    let cancelled = false
    const iframe = frame.current
    if (!armed || !iframe) return
    loadWidgetApi()
      .then((SC) => {
        if (cancelled) return
        const w = SC.Widget(iframe)
        const E = SC.Widget.Events
        w.bind(E.READY, () => {
          widget.current = w
          if (pendingStart.current) {
            pendingStart.current = false
            if (startAt > 0) w.seekTo(startAt * 1000)
            w.play()
            startGrace()
          }
        })
        w.bind(E.PLAY, () => {
          window.clearTimeout(graceTimer.current)
          setPlaying(true)
          setNeedsTap(false)
          if (openedForTap.current) {
            openedForTap.current = false
            setCollapsed(true)
          }
        })
        w.bind(E.PAUSE, () => setPlaying(false))
        w.bind(E.FINISH, () => {
          setPlaying(false)
          if (loop) {
            w.seekTo(startAt * 1000)
            w.play()
          }
        })
      })
      .catch(() => setNeedsTap(true))
    return () => {
      cancelled = true
      window.clearTimeout(graceTimer.current)
      widget.current = null
    }
  }, [armed, loop, startAt])

  useEffect(
    () =>
      registerMusic({
        prime: () => setArmed(true),
        start: () => {
          setArmed(true)
          if (widget.current) {
            if (startAt > 0) widget.current.seekTo(startAt * 1000)
            widget.current.play()
            startGrace()
          } else {
            // Still loading: READY plays it, and only then starts the wait
            // before asking for a tap.
            pendingStart.current = true
          }
        },
      }),
    [registerMusic, startAt]
  )

  const visible = mode !== "public" || opened

  const toggle = () => {
    if (!widget.current) {
      // Not loaded yet: load it and play as soon as it is ready.
      setArmed(true)
      pendingStart.current = true
      return
    }
    if (playing) {
      widget.current.pause()
    } else {
      widget.current.play()
      startGrace()
    }
  }

  const round =
    "grid size-8 shrink-0 place-items-center rounded-full outline-none transition-colors hover:bg-inv-surface focus-visible:ring-2 focus-visible:ring-inv-primary"

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 transition-opacity duration-500 in-data-[motion=none]:transition-none motion-reduce:transition-none",
        !visible && "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      {collapsed && (
        <div className="flex max-w-[min(15rem,calc(100vw-2rem))] items-center gap-0.5 rounded-full border border-inv-line bg-inv-bg/85 p-1 text-[0.7rem] text-inv-muted shadow-md backdrop-blur">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? t.music.pause : t.music.play}
            className={cn(round, "text-inv-primary")}
          >
            {playing ? (
              <Pause className="size-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Play className="size-3.5 fill-current" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              openedForTap.current = false
              setCollapsed(false)
            }}
            aria-label={t.music.expand}
            className="flex min-w-0 items-center gap-1.5 rounded-full py-1.5 pr-2.5 pl-1 outline-none hover:text-inv-fg focus-visible:ring-2 focus-visible:ring-inv-primary"
          >
            <Music2 className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{source.title}</span>
            <span className="shrink-0 max-sm:hidden">· SoundCloud</span>
            <ChevronUp className="size-3 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
      {/* Folded away, not removed: the widget is what plays the music. */}
      <div
        inert={collapsed}
        className={cn(
          "w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-inv-line bg-inv-bg/95 shadow-2xl backdrop-blur sm:w-[22rem]",
          collapsed &&
            "pointer-events-none absolute bottom-0 left-0 h-0 border-0 opacity-0"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
          <p
            className={cn(
              "text-inv-muted",
              needsTap && !playing && "font-medium text-inv-primary"
            )}
          >
            {needsTap && !playing
              ? t.music.tapWidget
              : playing
                ? t.music.nowPlaying
                : t.music.music}
          </p>
          <button
            type="button"
            onClick={() => {
              openedForTap.current = false
              setCollapsed(true)
            }}
            aria-label={t.music.minimize}
            className="rounded-full p-1 text-inv-muted hover:bg-inv-surface hover:text-inv-fg focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:outline-none"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>
        <iframe
          ref={frame}
          title={t.music.widgetTitle(source.title, source.artist)}
          src={armed ? src : undefined}
          allow="autoplay"
          className="block h-[166px] w-full border-0"
        />
      </div>
    </div>
  )
}

export function SoundCloudPlayer(props: Props) {
  return (
    <ClientOnly fallback={null}>
      <Dock {...props} />
    </ClientOnly>
  )
}
