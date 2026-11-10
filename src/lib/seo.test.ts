import { describe, expect, it } from "vitest"
import { POSTS } from "@/blog/posts"
import { CATEGORY_PAGES } from "@/templates/category-pages"
import { TEMPLATE_METAS } from "@/templates/registry"
import { TEMPLATE_CATEGORIES } from "@/templates/types"
import { absoluteUrl, breadcrumbJsonLd, seo } from "./seo"
import { sitemapPaths, sitemapXml } from "./sitemap"

describe("seo", () => {
  const head = seo({
    title: "Online Wedding Invitations · Alikeni",
    description: "A description.",
    path: "/templates/wedding/",
    jsonLd: [{ "@type": "Thing", name: "</script><b>" }],
  })

  it("sets a canonical URL on the public origin, without a trailing slash", () => {
    expect(head.links).toEqual([
      { rel: "canonical", href: "https://alikeni.com/templates/wedding" },
    ])
    expect(absoluteUrl("/")).toBe("https://alikeni.com/")
  })

  it("mirrors title and description into Open Graph and Twitter tags", () => {
    const find = (key: string) =>
      head.meta.find(
        (m) =>
          ("property" in m && m.property === key) ||
          ("name" in m && m.name === key)
      )
    expect(find("og:title")).toMatchObject({
      content: "Online Wedding Invitations · Alikeni",
    })
    expect(find("og:url")).toMatchObject({
      content: "https://alikeni.com/templates/wedding",
    })
    expect(find("twitter:card")).toMatchObject({
      content: "summary_large_image",
    })
    expect(find("og:image")).toMatchObject({
      content: "https://alikeni.com/og-default.png",
    })
  })

  it("serializes JSON-LD so its text cannot close the script tag", () => {
    expect(head.scripts).toHaveLength(1)
    expect(head.scripts[0].type).toBe("application/ld+json")
    expect(head.scripts[0].children).not.toContain("<")
    expect(JSON.parse(head.scripts[0].children)).toEqual({
      "@type": "Thing",
      name: "</script><b>",
    })
  })

  it("builds a breadcrumb trail with absolute URLs", () => {
    const trail = breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Templates", path: "/templates" },
    ])
    expect(trail.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://alikeni.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Templates",
        item: "https://alikeni.com/templates",
      },
    ])
  })
})

describe("occasion pages", () => {
  it("have copy that fits a search result", () => {
    for (const category of TEMPLATE_CATEGORIES) {
      const page = CATEGORY_PAGES[category]
      expect(page.title.length, `${category} title`).toBeLessThanOrEqual(60)
      expect(
        page.description.length,
        `${category} description`
      ).toBeGreaterThan(110)
      expect(
        page.description.length,
        `${category} description`
      ).toBeLessThanOrEqual(160)
      expect(page.questions.length).toBeGreaterThanOrEqual(3)
    }
  })

  it("have unique titles and descriptions", () => {
    const pages = Object.values(CATEGORY_PAGES)
    expect(new Set(pages.map((p) => p.title)).size).toBe(pages.length)
    expect(new Set(pages.map((p) => p.description)).size).toBe(pages.length)
  })
})

describe("sitemap", () => {
  it("lists home, the gallery, every occasion and every template once", () => {
    const paths = sitemapPaths()
    expect(paths).toContain("/")
    expect(paths).toContain("/templates")
    expect(paths).toContain("/templates/baby_shower")
    expect(paths).toContain("/blog")
    expect(paths).toContain(`/blog/${POSTS[0].slug}`)
    expect(paths).toContain("/templates/wedding/ivory-garden")
    expect(paths).toHaveLength(
      3 + POSTS.length + TEMPLATE_CATEGORIES.length + TEMPLATE_METAS.length
    )
    expect(new Set(paths).size).toBe(paths.length)
  })

  it("is valid sitemap XML with absolute URLs", () => {
    const xml = sitemapXml(["/", "/templates/wedding"])
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain("<loc>https://alikeni.com/</loc>")
    expect(xml).toContain("<loc>https://alikeni.com/templates/wedding</loc>")
    expect(xml).not.toMatch(/\/i\//)
  })
})
