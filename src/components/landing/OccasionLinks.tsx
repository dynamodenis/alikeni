import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { CATEGORY_PAGES } from "@/templates/category-pages"
import { COLLECTIONS, COLLECTION_PAGES } from "@/templates/collections"
import { TEMPLATE_CATEGORIES } from "@/templates/types"

/** Every landing page: the occasions, then the collections. */
const LINKS: ReadonlyArray<{ slug: string; label: string }> = [
  ...TEMPLATE_CATEGORIES.map((category) => ({
    slug: category,
    label: CATEGORY_PAGES[category].linkLabel,
  })),
  ...COLLECTIONS.map((collection) => ({
    slug: collection,
    label: COLLECTION_PAGES[collection].linkLabel,
  })),
]

/** Links to every occasion and collection page (/templates/<slug>), as pills. */
export function OccasionLinks({
  exclude,
  className,
}: {
  /** The page this is shown on. */
  exclude?: string
  className?: string
}) {
  return (
    <ul className={cn("flex flex-wrap justify-center gap-3", className)}>
      {LINKS.filter((link) => link.slug !== exclude).map((link) => (
        <li key={link.slug}>
          <Link
            to="/templates/$category"
            params={{ category: link.slug }}
            className="inline-flex rounded-full border border-gold/20 px-5 py-2.5 text-sm text-sand transition-colors duration-300 hover:border-gold/50 hover:text-cream focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
