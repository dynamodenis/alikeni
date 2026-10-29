import { useMemo } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import {
  getPublicPageFn,
  submitRsvpFn,
  submitWishFn,
} from "@/server/public/public.functions"
import { TemplateRenderer } from "@/templates/TemplateRenderer"
import type { InvitationActions } from "@/templates/_shared/context"
import { ShareBar } from "@/templates/_shared/blocks/ShareBar"
import { resolvePalette } from "@/templates/_shared/theme/palettes"

/**
 * The public invitation, `/i/<slug>?to=<name or guest token>`.
 *
 * - Loader (`getPublicPageFn`, one server round trip): the published config
 *   (404 when missing, draft-only or archived), approved wishes, the guest
 *   name, `APP_ORIGIN` for absolute URLs, and a page view (bots skipped,
 *   one per hashed IP + UA per invitation per UTC day).
 * - `?to=`: a `guests.slug_token` of this invitation shows that guest's
 *   stored name; anything else is treated as a name and sanitized on the
 *   server (controls and `<>` stripped, spaces collapsed, ≤ 60 chars).
 * - RSVP and wishes post through `submitRsvpFn` / `submitWishFn` (Zod,
 *   honeypot, optional Turnstile, 5/min + 30/day per IP per invitation).
 * - `head()`: title, description, canonical, Open Graph + Twitter card with
 *   `/og/<slug>.png` (1200×630), theme-color from the palette primary.
 * - Below the template: `ShareBar` (Web Share API, or copy link + WhatsApp).
 */
const PublicSearch = z.object({
  to: z.string().max(60).optional().catch(undefined),
})

export const Route = createFileRoute("/i/$slug")({
  validateSearch: PublicSearch,
  loaderDeps: ({ search }) => ({ to: search.to }),
  loader: async ({ params, deps }) => {
    const page = await getPublicPageFn({
      data: { slug: params.slug, to: deps.to },
    })
    if (!page) throw notFound()
    return page
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Invitation not found" }] }
    const { config, slug, origin } = loaderData
    const title = config.seo.title ?? config.event.title
    const description = truncate(
      config.seo.description ?? config.texts.message,
      200
    )
    const url = `${origin}/i/${slug}`
    const image = `${origin}/og/${slug}.png`
    return {
      meta: [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        ...(description
          ? [{ property: "og:description", content: description }]
          : []),
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: title },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        ...(description
          ? [{ name: "twitter:description", content: description }]
          : []),
        { name: "twitter:image", content: image },
        { name: "theme-color", content: resolvePalette(config.theme).primary },
      ],
      links: [{ rel: "canonical", href: url }],
    }
  },
  component: PublicInvitation,
})

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

function PublicInvitation() {
  const page = Route.useLoaderData()
  const { slug, config } = page

  const actions = useMemo<InvitationActions>(
    () => ({
      submitRsvp: async (input) => {
        await submitRsvpFn({
          data: { ...input, slug, website: input.website ?? "" },
        })
      },
      submitWish: (input) =>
        submitWishFn({
          data: { ...input, slug, website: input.website ?? "" },
        }),
    }),
    [slug]
  )
  const palette = useMemo(() => resolvePalette(config.theme), [config.theme])

  return (
    <>
      <TemplateRenderer
        templateId={page.templateId}
        config={config}
        mode="public"
        slug={slug}
        guestName={page.guestName}
        wishes={page.wishes}
        actions={actions}
      />
      <ShareBar
        title={config.seo.title ?? config.event.title}
        url={`${page.origin}/i/${slug}`}
        colors={{
          primary: palette.primary,
          background: palette.background,
          foreground: palette.foreground,
        }}
      />
    </>
  )
}
