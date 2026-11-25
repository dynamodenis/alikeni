// The pages meant for search results (home, the template gallery, one page
// per occasion, one per template, the blog), served as /sitemap.xml. Built from the
// template registry, so a new template is listed as soon as it ships.
// Invitations (/i/…), previews and account pages are deliberately absent.
import { POSTS } from "@/blog/posts"
import { absoluteUrl } from "@/lib/seo"
import { TEMPLATE_METAS } from "@/templates/registry"
import { TEMPLATE_CATEGORIES } from "@/templates/types"

export function sitemapPaths(): Array<string> {
  return [
    "/",
    "/templates",
    "/blog",
    ...POSTS.map((post) => `/blog/${post.slug}`),
    ...TEMPLATE_CATEGORIES.map((category) => `/templates/${category}`),
    ...TEMPLATE_METAS.map((meta) => `/templates/${meta.id}`),
  ]
}

/** Last change (YYYY-MM-DD) of the pages that record one: blog posts. */
export function sitemapLastmod(): Record<string, string> {
  return Object.fromEntries(
    POSTS.map((post) => [`/blog/${post.slug}`, post.updated ?? post.date])
  )
}

export function sitemapXml(
  paths: Array<string> = sitemapPaths(),
  lastmod: Record<string, string> = sitemapLastmod()
): string {
  const urls = paths
    .map((path) => {
      const changed = lastmod[path]
      return `  <url><loc>${absoluteUrl(path)}</loc>${
        changed ? `<lastmod>${changed}</lastmod>` : ""
      }</url>`
    })
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
