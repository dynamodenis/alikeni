// What /templates/<slug> lists: an occasion (a template category) or a
// collection that cuts across categories.
import { CATEGORY_LABELS } from "./catalog"
import { CATEGORY_PAGES, type CategoryPage } from "./category-pages"
import { COLLECTION_PAGES, isCollection } from "./collections"
import { TEMPLATE_METAS } from "./registry"
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateMeta,
} from "./types"

export type Listing = {
  slug: string
  page: CategoryPage
  /** Short name in breadcrumbs and headings ("Wedding", "Islamic"). */
  label: string
  templates: Array<TemplateMeta>
}

const isCategory = (value: string): value is TemplateCategory =>
  (TEMPLATE_CATEGORIES as ReadonlyArray<string>).includes(value)

export function getListing(slug: string): Listing | undefined {
  if (isCategory(slug)) {
    return {
      slug,
      page: CATEGORY_PAGES[slug],
      label: CATEGORY_LABELS[slug],
      templates: TEMPLATE_METAS.filter((t) => t.category === slug),
    }
  }
  if (isCollection(slug)) {
    const page = COLLECTION_PAGES[slug]
    return {
      slug,
      page,
      label: page.label,
      templates: TEMPLATE_METAS.filter((t) => t.tags.includes(page.tag)),
    }
  }
  return undefined
}
