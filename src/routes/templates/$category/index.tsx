import { SitePending } from "@/components/brand/pending"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { BrandLink } from "@/components/brand/ButtonLink"
import { SiteShell } from "@/components/gallery/SiteShell"
import { TemplateCard } from "@/components/gallery/TemplateCard"
import { Faq } from "@/components/landing/Faq"
import { GuideLinks } from "@/components/landing/GuideLinks"
import { Ornament } from "@/components/landing/InvitationCard"
import { RichText } from "@/blog/RichText"
import { OccasionLinks } from "@/components/landing/OccasionLinks"
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, seo } from "@/lib/seo"
import { getListing, type Listing } from "@/templates/listings"

/**
 * Landing page for an occasion or a collection, `/templates/<slug>` (e.g.
 * /templates/wedding, /templates/islamic): its templates under their own
 * title, intro and questions (`src/templates/category-pages.ts`,
 * `collections.ts`). Server-rendered, no search params.
 */
export const Route = createFileRoute("/templates/$category/")({
  // Posts are imported lazily so the articles stay out of the entry chunk.
  loader: async ({ params }) => {
    if (!getListing(params.category)) throw notFound()
    const { guidesFor } = await import("@/blog/posts")
    return { slug: params.category, guides: guidesFor(params.category) }
  },
  head: ({ loaderData }) => {
    const listing = loaderData && getListing(loaderData.slug)
    if (!listing) return { meta: [{ title: "Templates · Alikeni" }] }
    const { page, label, templates } = listing
    const path = `/templates/${listing.slug}`
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
          `${label} invitation templates`,
          templates.map((t) => ({ name: t.name, path: `/templates/${t.id}` }))
        ),
        faqJsonLd(page.questions),
      ],
    })
  },
  pendingComponent: SitePending,
  component: CategoryPage,
})

function CategoryPage() {
  const { slug, guides } = Route.useLoaderData()
  // The loader has already answered 404 for a slug that lists nothing.
  const { page, label, templates } = getListing(slug) as Listing

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
        aria-labelledby="about-heading"
        className="mx-auto max-w-2xl px-4 pt-6 pb-4 sm:px-6"
      >
        <h2 id="about-heading" className="heading-3">
          About {page.linkLabel.toLowerCase()}
        </h2>
        <p className="mt-5 body-copy">
          <RichText text={page.about[0]} />
        </p>
        {page.about.length > 1 && (
          // Native <details>: opens without JavaScript, and the text inside
          // is in the HTML for search engines either way.
          <details className="group mt-4">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm text-gold underline decoration-gold/40 underline-offset-4 transition-colors duration-300 hover:text-gold-soft focus-visible:text-gold-soft focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Read more</span>
              <span className="hidden group-open:inline">Show less</span>
            </summary>
            {page.about.slice(1).map((paragraph) => (
              <p key={paragraph} className="mt-4 body-copy">
                <RichText text={paragraph} />
              </p>
            ))}
          </details>
        )}
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

      <GuideLinks heading="Guides for hosts" posts={guides} />

      <section
        aria-labelledby="occasions-heading"
        className="border-t border-gold/10 px-4 py-16 sm:px-6"
      >
        <h2 id="occasions-heading" className="text-center heading-3">
          Invitations for other occasions
        </h2>
        <OccasionLinks exclude={slug} className="mt-8" />
      </section>
    </SiteShell>
  )
}
