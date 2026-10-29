// Public (unauthenticated) server functions for `/i/$slug`. Safe to import
// from routes: the build replaces handlers with RPC stubs on the client.
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import { getDb } from "@/server/db/client.server"
import { getRateLimiter } from "@/server/rate-limit"
import { fingerprint } from "./fingerprint.server"
import {
  PublicError,
  RsvpSubmission,
  WishSubmission,
  listWishesBySlug,
  loadPublicPage,
  submitRsvp,
  submitWish,
  type GuestContext,
} from "./public.server"
import { humanCheck } from "./turnstile.server"

const GENERIC = "Something went wrong. Please try again."

/** Only `PublicError` messages reach guests; everything else is logged. */
function guestError(error: unknown): Error {
  if (error instanceof PublicError) return new Error(error.message)
  console.error("[public]", error)
  return new Error(GENERIC)
}

/** Zod at the boundary, with a guest-friendly message instead of issue JSON. */
function parseOr<T extends z.ZodType>(schema: T) {
  return (input: z.input<T>): z.output<T> => {
    const result = schema.safeParse(input)
    if (!result.success) {
      throw new Error("Please check your answers and try again.")
    }
    return result.data
  }
}

async function guestContext(): Promise<GuestContext> {
  const { ipHash, uaHash } = await fingerprint(new Headers(getRequestHeaders()))
  return {
    ipHash,
    uaHash,
    limiter: getRateLimiter(),
    verifyHuman: humanCheck(serverEnv.TURNSTILE_SECRET_KEY),
  }
}

/**
 * The page loader: published invitation, approved wishes, guest name from
 * `?to=`, and a deduplicated page view. Null when missing or archived.
 */
export const getPublicPageFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      slug: z.string().trim().toLowerCase().min(1).max(80),
      to: z.string().max(60).optional(),
    })
  )
  .handler(async ({ data }) => {
    const visitor = await fingerprint(new Headers(getRequestHeaders()))
    const page = await loadPublicPage(getDb(), data, visitor)
    if (!page) return null
    return { ...page, origin: serverEnv.APP_ORIGIN }
  })

export const submitRsvpFn = createServerFn({ method: "POST" })
  .validator(parseOr(RsvpSubmission))
  .handler(async ({ data }) => {
    try {
      return await submitRsvp(getDb(), data, await guestContext())
    } catch (error) {
      throw guestError(error)
    }
  })

export const submitWishFn = createServerFn({ method: "POST" })
  .validator(parseOr(WishSubmission))
  .handler(async ({ data }) => {
    try {
      return await submitWish(getDb(), data, await guestContext())
    } catch (error) {
      throw guestError(error)
    }
  })

/** Approved wishes for a published slug, newest first (max 50). */
export const listWishesFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().trim().toLowerCase().min(1).max(80) }))
  .handler(async ({ data }) => listWishesBySlug(getDb(), data.slug))
