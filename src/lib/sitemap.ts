// The pages meant for search results (home, the template gallery, one page
// per occasion, one per template), served as /sitemap.xml. Built from the
// template registry, so a new template is listed as soon as it ships.
// Invitations (/i/…), previews and account pages are deliberately absent.
import { absoluteUrl } from "@/lib/seo"
import { TEMPLATE_METAS } from "@/templates/registry"
import { TEMPLATE_CATEGORIES } from "@/templates/types"

export function sitemapPaths(): Array<string> {
  return [
    "/",
    "/templates",
    ...TEMPLATE_CATEGORIES.map((category) => `/templates/${category}`),
    ...TEMPLATE_METAS.map((meta) => `/templates/${meta.id}`),
  ]
}

export function sitemapXml(paths: Array<string> = sitemapPaths()): string {
  const urls = paths
    .map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`)
    .join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}
