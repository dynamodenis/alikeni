// Server functions for the dashboard, responses and guest pages. Safe to
// import from routes: the build replaces handlers with RPC stubs.
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { getDb } from "@/server/db/client.server"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import {
  deleteInvitation,
  duplicateInvitation,
  setArchived,
} from "./dashboard.server"
import {
  GUEST_GROUP_MAX,
  GUEST_NAME_MAX,
  addGuest,
  listGuests,
  removeGuest,
} from "./guests.server"
import {
  getOwnedSummary,
  getResponses,
  setWishApproved,
} from "./responses.server"

const NOT_FOUND = "Invitation not found."

/** Not-found and sign-in messages are public; anything else is generic. */
function publicError(error: unknown): Error {
  if (error instanceof UnauthorizedError) return error
  if (error instanceof Error && error.message === NOT_FOUND) return error
  console.error("[dashboard]", error)
  return new Error("Something went wrong. Please try again.")
}

async function withOwner<T>(run: (ownerId: string) => Promise<T>) {
  try {
    const db = getDb()
    return await run(await requireUserId(db))
  } catch (error) {
    throw publicError(error)
  }
}

function found<T>(value: T | null | false): T {
  if (value === null || value === false) throw new Error(NOT_FOUND)
  return value
}

const ById = z.object({ id: z.uuid() })

export const duplicateInvitationFn = createServerFn({ method: "POST" })
  .validator(ById)
  .handler(({ data }) =>
    withOwner(async (ownerId) =>
      found(await duplicateInvitation(getDb(), { id: data.id, ownerId }))
    )
  )

export const setArchivedFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.uuid(), archived: z.boolean() }))
  .handler(({ data }) =>
    withOwner(async (ownerId) => ({
      status: found(await setArchived(getDb(), { ...data, ownerId })),
    }))
  )

export const deleteInvitationFn = createServerFn({ method: "POST" })
  .validator(ById)
  .handler(({ data }) =>
    withOwner(async (ownerId) => {
      found(await deleteInvitation(getDb(), { id: data.id, ownerId }))
      return { ok: true as const }
    })
  )

/** Responses page data; null when the invitation is not the user's. */
export const getResponsesFn = createServerFn({ method: "GET" })
  .validator(ById)
  .handler(({ data }) =>
    withOwner(async (ownerId) => {
      const result = await getResponses(getDb(), { id: data.id, ownerId })
      if (!result) return null
      return {
        ...result,
        rsvps: result.rsvps.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        wishes: result.wishes.map((w) => ({
          ...w,
          createdAt: w.createdAt.toISOString(),
        })),
      }
    })
  )

export const setWishApprovedFn = createServerFn({ method: "POST" })
  .validator(z.object({ wishId: z.uuid(), approved: z.boolean() }))
  .handler(({ data }) =>
    withOwner(async (ownerId) => {
      found(await setWishApproved(getDb(), { ...data, ownerId }))
      return { approved: data.approved }
    })
  )

/** Guest page data; null when the invitation is not the user's. */
export const getGuestsFn = createServerFn({ method: "GET" })
  .validator(ById)
  .handler(({ data }) =>
    withOwner(async (ownerId) => {
      const db = getDb()
      const invitation = await getOwnedSummary(db, { id: data.id, ownerId })
      if (!invitation) return null
      const guests = await listGuests(db, { invitationId: data.id, ownerId })
      return { invitation, guests: guests ?? [] }
    })
  )

export const addGuestFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      invitationId: z.uuid(),
      name: z.string().trim().min(1, "Name is required").max(GUEST_NAME_MAX),
      group: z.string().trim().max(GUEST_GROUP_MAX).optional(),
    })
  )
  .handler(({ data }) =>
    withOwner(async (ownerId) =>
      found(await addGuest(getDb(), { ...data, ownerId }))
    )
  )

export const removeGuestFn = createServerFn({ method: "POST" })
  .validator(z.object({ guestId: z.uuid() }))
  .handler(({ data }) =>
    withOwner(async (ownerId) => {
      found(await removeGuest(getDb(), { guestId: data.guestId, ownerId }))
      return { ok: true as const }
    })
  )
