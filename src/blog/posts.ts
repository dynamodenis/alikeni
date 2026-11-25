// Blog posts as data: plain blocks rendered by /blog/$slug. To publish a
// post, add a file under `posts/` and list it in POSTS (newest first); the
// blog index, the sitemap, related links and the article's search tags all
// read from here.
import { collectRsvpsWithoutAnApp } from "./posts/collect-rsvps-without-an-app"
import { graduationInvitationWording } from "./posts/graduation-invitation-wording"
import { nikahWalimaInvitationWording } from "./posts/nikah-walima-invitation-wording"
import { whatsappInvitationsRsvp } from "./posts/whatsapp-invitations-rsvp"
import { whatsappWeddingInvitation } from "./posts/whatsapp-wedding-invitation"
import type { Post, PostSummary } from "./types"

export type { Block, Post, PostSummary } from "./types"
export { formatPostDate } from "./types"

export const POSTS: ReadonlyArray<Post> = [
  nikahWalimaInvitationWording,
  whatsappWeddingInvitation,
  collectRsvpsWithoutAnApp,
  graduationInvitationWording,
  whatsappInvitationsRsvp,
]

export const getPost = (slug: string): Post | undefined =>
  POSTS.find((post) => post.slug === slug)

export const summarize = ({
  slug,
  title,
  description,
  date,
  readMinutes,
}: Post): PostSummary => ({ slug, title, description, date, readMinutes })

/** Posts to suggest under `post`: its own picks first, then the newest. */
export function relatedPosts(post: Post, count = 3): Array<PostSummary> {
  const picked = (post.related ?? [])
    .map(getPost)
    .filter((other): other is Post => !!other && other.slug !== post.slug)
  const rest = POSTS.filter(
    (other) => other.slug !== post.slug && !picked.includes(other)
  )
  return [...picked, ...rest].slice(0, count).map(summarize)
}

/** Every question a post answers in its FAQ blocks. */
export const postFaqs = (post: Post): Array<{ q: string; a: string }> =>
  post.blocks.flatMap((block) => (block.type === "faq" ? block.items : []))

/**
 * Posts to link from a page: those written for `category` (an occasion or a
 * collection) first, then the newest.
 */
export function guidesFor(category?: string, count = 3): Array<PostSummary> {
  const own = POSTS.filter((post) => category && post.category === category)
  const rest = POSTS.filter((post) => !own.includes(post))
  return [...own, ...rest].slice(0, count).map(summarize)
}
