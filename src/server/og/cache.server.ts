// OG cards are cached in object storage under a key that includes the publish
// time, so a republish gets a fresh card without any purge. Kept free of the
// renderer so the publish path can import it cheaply.
import type {
  Bytes,
  ServerObjects,
  StorageDriver,
} from "@/server/storage/types"

export const OG_CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

/**
 * `og/<invitationId>-<publishedAt epoch ms>.png`. The name is historical: the
 * stored card is JPEG where the runtime can compress it (see `OgDeps.compress`),
 * and its stored content type says which.
 */
export function ogCacheKey(invitationId: string, publishedAt: string | Date) {
  return `og/${invitationId}-${new Date(publishedAt).getTime()}.png`
}

/**
 * Delete the card for a previous publish. Best effort: storage trouble is
 * logged, never thrown, so it cannot fail a publish.
 */
export async function invalidateOgCard(
  storage: Pick<StorageDriver, "delete">,
  invitationId: string,
  previousPublishedAt: string | Date | null | undefined
): Promise<void> {
  if (!previousPublishedAt) return
  try {
    await storage.delete(ogCacheKey(invitationId, previousPublishedAt))
  } catch (error) {
    console.warn("[og] could not delete the previous card", error)
  }
}

export type OgSource = { id: string; publishedAt: string | null }

/** JPEG starts FF D8 FF; everything the renderer makes otherwise is PNG. */
export function cardMime(bytes: Bytes): "image/jpeg" | "image/png" {
  return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    ? "image/jpeg"
    : "image/png"
}

const CARD_MIMES = new Set(["image/png", "image/jpeg"])

/**
 * Stored card on a hit; otherwise render, store, return. A failed store still
 * serves the freshly rendered card.
 */
export async function getOrRenderCard(
  storage: ServerObjects,
  invitation: OgSource,
  render: () => Promise<Bytes>
): Promise<{
  body: ReadableStream<Bytes> | Bytes
  mime: string
  hit: boolean
}> {
  const key = invitation.publishedAt
    ? ogCacheKey(invitation.id, invitation.publishedAt)
    : null
  if (key) {
    try {
      const stored = await storage.get(key)
      if (stored) {
        const mime = CARD_MIMES.has(stored.mime) ? stored.mime : "image/png"
        return { body: stored.body, mime, hit: true }
      }
    } catch (error) {
      console.warn("[og] cache read failed", error)
    }
  }
  const card = await render()
  const mime = cardMime(card)
  if (key) {
    try {
      await storage.put(key, card, mime)
    } catch (error) {
      console.warn("[og] cache write failed", error)
    }
  }
  return { body: card, mime, hit: false }
}

/**
 * Publish hook: drop the card for the publish being replaced, using the app's
 * storage. Never throws.
 */
export async function invalidatePublishedCard(
  invitationId: string,
  previousPublishedAt: Date | null | undefined
): Promise<void> {
  if (!previousPublishedAt) return
  try {
    const { getStorage } = await import("@/server/storage/index.server")
    await invalidateOgCard(getStorage(), invitationId, previousPublishedAt)
  } catch (error) {
    console.warn("[og] storage unavailable; previous card left in place", error)
  }
}
