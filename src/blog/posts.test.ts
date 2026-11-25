import { describe, expect, it } from "vitest"
import { sitemapPaths, sitemapXml } from "@/lib/sitemap"
import { TEMPLATE_METAS } from "@/templates/registry"
import { TEMPLATE_CATEGORIES } from "@/templates/types"
import { POSTS, getPost, postFaqs, relatedPosts } from "./posts"
import { parseInline, plainText, type Post } from "./types"

/** Every line of a post that may carry `[label](/path)` links. */
const linkableText = (post: Post): Array<string> =>
  post.blocks.flatMap((block) => {
    switch (block.type) {
      case "p":
      case "tip":
        return [block.text]
      case "ul":
      case "ol":
        return block.items
      case "faq":
        return block.items.map((item) => item.a)
      default:
        return []
    }
  })

const links = (post: Post): Array<string> =>
  linkableText(post).flatMap((text) =>
    parseInline(text).flatMap((part) => (part.href ? [part.href] : []))
  )

const wordCount = (post: Post): number =>
  post.blocks
    .flatMap((block) => {
      switch (block.type) {
        case "ul":
        case "ol":
          return block.items
        case "faq":
          return block.items.flatMap((item) => [item.q, item.a])
        default:
          return [block.text]
      }
    })
    .map(plainText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length

describe("inline links", () => {
  it("splits links out of text and leaves [your link] alone", () => {
    expect(parseInline("See [the templates](/templates) now.")).toEqual([
      { text: "See " },
      { text: "the templates", href: "/templates" },
      { text: " now." },
    ])
    expect(parseInline("Details:\n[your link]")).toEqual([
      { text: "Details:\n[your link]" },
    ])
    expect(plainText("Read [this](/blog/a) first")).toBe("Read this first")
  })
})

describe("blog posts", () => {
  it("have unique slugs, titles and descriptions that fit a search result", () => {
    expect(new Set(POSTS.map((p) => p.slug)).size).toBe(POSTS.length)
    expect(new Set(POSTS.map((p) => p.title)).size).toBe(POSTS.length)
    expect(new Set(POSTS.map((p) => p.description)).size).toBe(POSTS.length)
    for (const post of POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/)
      expect(post.title.length, post.slug).toBeLessThanOrEqual(60)
      expect(post.description.length, post.slug).toBeGreaterThan(110)
      expect(post.description.length, post.slug).toBeLessThanOrEqual(160)
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it("are listed newest first", () => {
    const dates = POSTS.map((p) => p.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it("only link to pages that exist", () => {
    const known = new Set([
      ...sitemapPaths(),
      ...TEMPLATE_CATEGORIES.map((c) => `/templates/${c}`),
      ...TEMPLATE_METAS.map((t) => `/templates/${t.id}`),
    ])
    for (const post of POSTS) {
      for (const href of links(post)) {
        expect(known.has(href), `${post.slug} links to ${href}`).toBe(true)
      }
      for (const slug of post.related ?? []) {
        expect(getPost(slug), `${post.slug} relates to ${slug}`).toBeDefined()
      }
    }
  })

  it("with an FAQ link to templates and stay within the agreed length", () => {
    const guides = POSTS.filter((post) => postFaqs(post).length > 0)
    expect(guides.length).toBeGreaterThanOrEqual(3)
    for (const post of guides) {
      expect(postFaqs(post).length, post.slug).toBeGreaterThanOrEqual(3)
      expect(
        links(post).some((href) => href.startsWith("/templates/")),
        post.slug
      ).toBe(true)
      expect(wordCount(post), post.slug).toBeGreaterThanOrEqual(900)
      expect(wordCount(post), post.slug).toBeLessThanOrEqual(1400)
    }
  })

  it("suggest other posts, never themselves", () => {
    for (const post of POSTS) {
      const related = relatedPosts(post)
      expect(related.length).toBeGreaterThan(0)
      expect(related.map((p) => p.slug)).not.toContain(post.slug)
    }
  })

  it("are all in the sitemap with the date they last changed", () => {
    const xml = sitemapXml()
    for (const post of POSTS) {
      expect(sitemapPaths()).toContain(`/blog/${post.slug}`)
      expect(xml).toContain(
        `<loc>https://alikeni.com/blog/${post.slug}</loc><lastmod>${post.updated ?? post.date}</lastmod>`
      )
    }
  })
})
