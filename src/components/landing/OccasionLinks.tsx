import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { CATEGORY_PAGES } from "@/templates/category-pages"
import { TEMPLATE_CATEGORIES, type TemplateCategory } from "@/templates/types"

/** Links to every occasion page (/templates/<category>), as pills. */
export function OccasionLinks({
  exclude,
  className,
}: {
  /** The page this is shown on. */
  exclude?: TemplateCategory
  className?: string
}) {
  return (
    <ul className={cn("flex flex-wrap justify-center gap-3", className)}>
      {TEMPLATE_CATEGORIES.filter((category) => category !== exclude).map(
        (category) => (
          <li key={category}>
            <Link
              to="/templates/$category"
              params={{ category }}
              className="inline-flex rounded-full border border-gold/20 px-5 py-2.5 text-sm text-sand transition-colors duration-300 hover:border-gold/50 hover:text-cream focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              {CATEGORY_PAGES[category].linkLabel}
            </Link>
          </li>
        )
      )}
    </ul>
  )
}
