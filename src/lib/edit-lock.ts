// After the event, an invitation is locked: only photos and the closing
// words may still change. Without this a host could move the date forward to
// bring a free page back online, or reuse one paid invitation for another
// event. Isomorphic: the server enforces it (saveDraft, publish), the editor
// shows it.
import { getIn, setIn, type Path } from "./set-in"
import { eventHasEnded } from "./plans"
import type { InvitationConfigBase } from "@/templates/_shared/schema"

/** Config paths that stay editable once an invitation is locked. */
export const LOCKED_EDITABLE_PATHS: ReadonlyArray<Path> = [
  ["gallery"],
  ["texts", "closing"],
]

/** Whether `path` (or the value it sits inside) may change while locked. */
export function canEditWhenLocked(path: Path): boolean {
  return LOCKED_EDITABLE_PATHS.some((open) =>
    open.every((segment, i) => path[i] === segment)
  )
}

type Lockable = {
  /** What guests last saw. Never published: never locked. */
  publishedConfig: Pick<InvitationConfigBase, "datetime" | "event"> | null
  /** Support override: edits are open again until this moment. */
  editUnlockedUntil?: Date | string | null
}

/**
 * Locked once the **published** event has ended (the day after its last
 * event day has passed, in the event's time zone: the moment a free page
 * goes offline). The draft's date is ignored on purpose, and so is the
 * status: unpublishing or archiving does not reopen it.
 */
export function isEditLocked(invitation: Lockable, now = new Date()): boolean {
  if (!invitation.publishedConfig) return false
  const until = invitation.editUnlockedUntil
  if (until && new Date(until).getTime() > now.getTime()) return false
  return eventHasEnded(invitation.publishedConfig, now)
}

/**
 * `base` with only the still-editable parts taken from `incoming`. Used by
 * the server so nothing else can change, whatever the client sends.
 */
export function applyLockedEdits<T>(base: T, incoming: unknown): T {
  let next = base
  for (const path of LOCKED_EDITABLE_PATHS) {
    const value = getIn(incoming, path)
    if (value !== undefined) next = setIn(next, path, value)
  }
  return next
}
