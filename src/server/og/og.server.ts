// GET /og/<slug>.png: the invitation's Open Graph card, published only.
import { z } from "zod"
import { SLUG_PATTERN } from "@/lib/slug"
import { getPublishedBySlug } from "@/server/invitations/editing.server"
import type { Bytes, ServerObjects } from "@/server/storage/types"
import { OG_CACHE_CONTROL, getOrRenderCard } from "./cache.server"
import {
  renderOgCard,
  type OgConfig,
  type RenderOptions,
} from "./render.server"

type Db = Parameters<typeof getPublishedBySlug>[0]

/** Anything that is not a valid slug cannot exist; skip the query. */
const OgSlug = z.string().max(60).toLowerCase().regex(SLUG_PATTERN)

export type OgDeps = {
  db: Db
  storage: ServerObjects
  render?: (config: OgConfig, options?: RenderOptions) => Promise<Bytes>
}

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })

export async function ogImageResponse(
  rawSlug: string,
  deps: OgDeps
): Promise<Response> {
  const slug = OgSlug.safeParse(rawSlug)
  if (!slug.success) return notFound()
  const invitation = await getPublishedBySlug(deps.db, slug.data)
  if (!invitation) return notFound()

  const render = deps.render ?? renderOgCard
  try {
    const { body, hit } = await getOrRenderCard(deps.storage, invitation, () =>
      render(invitation.config)
    )
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": OG_CACHE_CONTROL,
        "X-Og-Cache": hit ? "hit" : "miss",
      },
    })
  } catch (error) {
    console.error("[og] render failed", error)
    return new Response("Could not render image", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
