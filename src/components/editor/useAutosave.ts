import { useServerFn } from "@tanstack/react-start"
import { useCallback, useEffect, useRef, useState } from "react"
import { saveDraftFn } from "@/server/invitations/invitations.functions"
import type { EditorConfig } from "./EditorContext"

export type SaveState =
  "saved" | "dirty" | "saving" | "invalid" | "conflict" | "error"

const DEBOUNCE_MS = 1500

type Failure = { kind: "conflict" | "error"; config: EditorConfig }

/**
 * Debounced autosave with optimistic concurrency. The status is derived from
 * (current config, last saved config, validity, in-flight, failure) rather
 * than stored, so it can never drift. Only valid configs are sent; the
 * server re-validates. A conflict pauses saving until the user decides.
 */
export function useAutosave(opts: {
  id: string
  config: EditorConfig
  valid: boolean
  initialUpdatedAt: string
}) {
  const save = useServerFn(saveDraftFn)
  const [savedConfig, setSavedConfig] = useState(opts.config)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState(opts.initialUpdatedAt)
  const base = useRef(opts.initialUpdatedAt)
  const latest = useRef(opts.config)
  const savedRef = useRef(opts.config)
  const inFlight = useRef(false)
  /** The save in progress, so `settle` can wait for it. */
  const running = useRef<Promise<void> | null>(null)
  const valid = useRef(opts.valid)

  useEffect(() => {
    latest.current = opts.config
    valid.current = opts.valid
  })

  // A conflict blocks until resolved; an ordinary error only for the config that failed.
  const failed =
    failure && (failure.kind === "conflict" || failure.config === opts.config)
      ? failure.kind
      : null
  const state: SaveState =
    failed ??
    (saving
      ? "saving"
      : opts.config === savedConfig
        ? "saved"
        : opts.valid
          ? "dirty"
          : "invalid")

  const flush = useCallback(
    (force = false): Promise<void> => {
      if (inFlight.current) return running.current ?? Promise.resolve()
      const snapshot = latest.current
      if (!force && snapshot === savedRef.current) return Promise.resolve()
      inFlight.current = true
      setSaving(true)
      const run = async () => {
        try {
          const result = await save({
            data: {
              id: opts.id,
              config: snapshot,
              baseUpdatedAt: base.current,
              force,
            },
          })
          base.current = result.updatedAt
          savedRef.current = snapshot
          setSavedConfig(snapshot)
          setLastSavedAt(result.updatedAt)
          setFailure(null)
        } catch (error) {
          const message = error instanceof Error ? error.message : ""
          setFailure({
            kind: message.startsWith("conflict:") ? "conflict" : "error",
            config: snapshot,
          })
        } finally {
          inFlight.current = false
          running.current = null
          setSaving(false)
        }
      }
      running.current = run()
      return running.current
    },
    [save, opts.id]
  )

  /**
   * Save whatever is still pending, for leaving the editor inside the app
   * (no page reload, so `beforeunload` does not fire). Resolves true when
   * everything is saved, false when it cannot be (invalid fields, a
   * conflict, the network).
   */
  const settle = useCallback(async () => {
    // A save in progress may predate the last edit: go round again after it.
    for (let attempt = 0; attempt < 3; attempt++) {
      if (latest.current === savedRef.current) return true
      if (!valid.current) return false
      await flush()
    }
    return latest.current === savedRef.current
  }, [flush])

  // Save once edits pause (also picks up edits made during a save).
  useEffect(() => {
    if (state !== "dirty") return
    const timer = window.setTimeout(() => void flush(), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [state, opts.config, flush])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current !== savedRef.current) event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [])

  /** After publish the row's version moves; adopt it so the next save does not conflict. */
  const adoptVersion = useCallback((updatedAt: string) => {
    base.current = updatedAt
    setLastSavedAt(updatedAt)
  }, [])

  /** The server replaced the draft (discard): `config` is now what is saved. */
  const adoptDraft = useCallback((config: EditorConfig, updatedAt: string) => {
    latest.current = config
    savedRef.current = config
    base.current = updatedAt
    setSavedConfig(config)
    setLastSavedAt(updatedAt)
    setFailure(null)
  }, [])

  return { state, lastSavedAt, flush, settle, adoptVersion, adoptDraft }
}
