import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { BrandLink } from "@/components/brand/ButtonLink"
import { SiteShell } from "@/components/gallery/SiteShell"
import { TemplateCard } from "@/components/gallery/TemplateCard"
import { Faq } from "@/components/landing/Faq"
import { Ornament } from "@/components/landing/InvitationCard"
import { OccasionLinks } from "@/components/landing/OccasionLinks"
import { breadcrumbJsonLd, itemListJsonLd, seo } from "@/lib/seo"
import { CATEGORY_LABELS } from "@/templates/catalog"
import { CATEGORY_PAGES } from "@/templates/category-pages"
import { TEMPLATE_METAS } from "@/templates/registry"
import { TEMPLATE_CATEGORIES, type TemplateCategory } from "@/templates/types"

const isCategory = (value: string): value is TemplateCategory =>
  (TEMPLATE_CATEGORIES as ReadonlyArray<string>).includes(value)

/**
 * Occasion landing page, `/templates/<category>` (e.g. /templates/wedding):
 * that occasion's templates under their own title, intro and questions
 * (`src/templates/category-pages.ts`). Server-rendered, no search params.
 */
export const Route = createFileRoute("/templates/$category/")({
  loader: ({ params }) => {
    if (!isCategory(params.category)) throw notFound()
    return { category: params.category }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Templates · Alikeni" }] }
    const { category } = loaderData
    const page = CATEGORY_PAGES[category]
    const path = `/templates/${category}`
    const templates = TEMPLATE_METAS.filter((t) => t.category === category)
    return seo({
      title: page.title,
      description: page.description,
      path,
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Invitation templates", path: "/templates" },
          { name: page.linkLabel, path },
        ]),
        itemListJsonLd(
          `${CATEGORY_LABELS[category]} invitation templates`,
          templates.map((t) => ({ name: t.name, path: `/templates/${t.id}` }))
        ),
      ],
    })
  },
  component: CategoryPage,
})

function CategoryPage() {
  const { category } = Route.useLoaderData()
  const page = CATEGORY_PAGES[category]
  const templates = TEMPLATE_METAS.filter((t) => t.category === category)
  const label = CATEGORY_LABELS[category]

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden px-4 pt-36 pb-12 sm:px-6 sm:pt-44">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(201,160,90,0.18),transparent_65%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-sand">
              <li>
                <Link to="/" className="link">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/templates" className="link">
                  Templates
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-cream">
                {label}
              </li>
            </ol>
          </nav>
          <h1 className="mt-6 heading-1">
            {page.lead}{" "}
            <span className="text-gold-gradient italic">{page.accent}</span>
          </h1>
          <Ornament className="mx-auto mt-7 w-32 text-gold/60" />
          <p className="mx-auto mt-7 max-w-2xl lead">{page.intro}</p>
        </div>
      </section>

      <section
        aria-labelledby="templates-heading"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="templates-heading" className="heading-3">
            {label} invitation templates
          </h2>
          <p className="label">
            <span className="nums">{templates.length}</span> designs
          </p>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((meta, i) => (
            <li key={meta.id} className="mx-auto w-full max-w-sm">
              <TemplateCard meta={meta} priority={i === 0 ? "high" : i < 3} />
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="questions-heading"
        className="px-4 py-20 sm:px-6"
      >
        <h2 id="questions-heading" className="text-center heading-2">
          Questions about {page.linkLabel.toLowerCase()}
        </h2>
        <div className="mt-12">
          <Faq items={page.questions} />
        </div>
        <div className="mt-14 text-center">
          <BrandLink to="/templates" arrow>
            See every template
          </BrandLink>
        </div>
      </section>

      <section
        aria-labelledby="occasions-heading"
        className="border-t border-gold/10 px-4 py-16 sm:px-6"
      >
        <h2 id="occasions-heading" className="text-center heading-3">
          Invitations for other occasions
        </h2>
        <OccasionLinks exclude={category} className="mt-8" />
      </section>
    </SiteShell>
  )
}
