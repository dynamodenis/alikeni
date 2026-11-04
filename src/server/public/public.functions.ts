// Public (unauthenticated) server functions for `/i/$slug`. Safe to import
// from routes: the build replaces handlers with RPC stubs on the client.
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import { getDb } from "@/server/db/client.server"
import { getRateLimiter } from "@/server/rate-limit/limiter.server"
import { fingerprint } from "./fingerprint.server"
import {
  PublicError,
  RsvpSubmission,
  WishSubmission,
  listWishesBySlug,
  loadPublicPage,
  recordViewBySlug,
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

const SlugInput = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(80),
})

/**
 * The page loader: published invitation, approved wishes and the guest name
 * from `?to=`. Null when missing or archived. Visitor-independent, so the
 * HTML can be cached (`/i/$slug` sends `s-maxage`); views are counted by
 * `recordViewFn`.
 */
export const getPublicPageFn = createServerFn({ method: "GET" })
  .validator(
    SlugInput.extend({
      to: z.string().max(60).optional(),
    })
  )
  .handler(async ({ data }) => {
    const page = await loadPublicPage(getDb(), data)
    if (!page) return null
    return { ...page, origin: serverEnv.APP_ORIGIN }
  })

/**
 * View beacon: the page calls it once after hydration. Bots (by user agent)
 * are skipped here on the server; one count per hashed IP + UA per
 * invitation per UTC day. Never throws to the guest.
 */
export const recordViewFn = createServerFn({ method: "POST" })
  .validator(SlugInput)
  .handler(async ({ data }) => {
    try {
      const visitor = await fingerprint(new Headers(getRequestHeaders()))
      if (visitor.bot) return { counted: false }
      return { counted: await recordViewBySlug(getDb(), data.slug, visitor) }
    } catch (error) {
      console.error("[public] recordView failed", error)
      return { counted: false }
    }
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
  .validator(SlugInput)
  .handler(async ({ data }) => listWishesBySlug(getDb(), data.slug))
