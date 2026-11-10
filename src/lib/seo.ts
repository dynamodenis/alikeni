// Search and sharing tags for the marketing pages, in one place: title,
// description, canonical URL, Open Graph, Twitter card, robots and JSON-LD.
// Routes spread the result into `head()`. Isomorphic and dependency-free.

/** The one public address (APP_ORIGIN in production). Canonicals point here. */
export const SITE_ORIGIN = "https://alikeni.com"
export const SITE_NAME = "Alikeni"
/** 1200×630 share card (public/og-default.png, from `pnpm brand:icons`). */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-default.png`

export const absoluteUrl = (path: string) =>
  `${SITE_ORIGIN}${path === "/" ? "/" : path.replace(/\/+$/, "")}`

type JsonLd = Record<string, unknown>

export type SeoInput = {
  /** Full <title>, about 50–60 characters, the main phrase first. */
  title: string
  /** About 120–155 characters. */
  description: string
  /** Canonical path without query string, e.g. "/templates/wedding". */
  path: string
  /** Absolute image URL; defaults to the site share card. */
  image?: string
  imageAlt?: string
  jsonLd?: Array<JsonLd>
}

export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = title,
  jsonLd = [],
}: SeoInput) {
  const url = absoluteUrl(path)
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.map((data) => ({
      type: "application/ld+json",
      // "<" escaped so text inside the data can never close the script tag.
      children: JSON.stringify(data).replace(/</g, "\\u003c"),
    })),
  }
}

/** For pages that must stay out of search results (sign-in, previews, …). */
export const NOINDEX = { name: "robots", content: "noindex, nofollow" } as const

/* ---------- structured data ---------- */

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`

export const organizationJsonLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/icon-512.png`,
  email: "info@alikeni.com",
}

export const websiteJsonLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  publisher: { "@id": ORGANIZATION_ID },
}

/** The product itself: a free web app, with a paid upgrade not listed here. */
export const webApplicationJsonLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: `${SITE_ORIGIN}/`,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  description:
    "Online invitation maker: invitation websites for weddings, birthdays and other events with RSVP, countdown, map, music and guest wishes.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@id": ORGANIZATION_ID },
}

/** Breadcrumb trail; `items` run from the home page down to this page. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** A list of pages (a template collection). */
export function itemListJsonLd(
  name: string,
  items: Array<{ name: string; path: string }>
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  }
}
