import { SitePending } from "@/components/brand/pending"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { BrandLink } from "@/components/brand/ButtonLink"
import { SiteShell } from "@/components/gallery/SiteShell"
import { TemplateCard } from "@/components/gallery/TemplateCard"
import { OccasionLinks } from "@/components/landing/OccasionLinks"
import { RichText } from "@/blog/RichText"
import SHOTS from "@/blog/shots.json"
import { formatPostDate, plainText, type Block } from "@/blog/types"
import { articleJsonLd, breadcrumbJsonLd, faqJsonLd, seo } from "@/lib/seo"
import { getListing } from "@/templates/listings"

/** How many of the occasion's templates a post shows. */
const TEMPLATES_SHOWN = 3

/** One blog post, `/blog/<slug>` (content in `src/blog/posts/`). */
export const Route = createFileRoute("/blog/$slug")({
  // Posts are imported lazily so route configs (which live in the app entry
  // chunk) do not carry every article onto every page.
  loader: async ({ params }) => {
    const { getPost, postFaqs, relatedPosts } = await import("@/blog/posts")
    const post = getPost(params.slug)
    if (!post) throw notFound()
    return {
      post,
      related: relatedPosts(post),
      faqs: postFaqs(post).map((item) => ({
        q: item.q,
        a: plainText(item.a),
      })),
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog · Alikeni" }] }
    const { post, faqs } = loaderData
    const path = `/blog/${post.slug}`
    const branded = `${post.title} · Alikeni`
    const head = seo({
      title: branded.length <= 60 ? branded : post.title,
      description: post.description,
      path,
      jsonLd: [
        articleJsonLd({ ...post, path }),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ]),
        ...(faqs.length ? [faqJsonLd(faqs)] : []),
      ],
    })
    return {
      ...head,
      meta: [
        ...head.meta.filter(
          (m) => !("property" in m && m.property === "og:type")
        ),
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.date },
        {
          property: "article:modified_time",
          content: post.updated ?? post.date,
        },
      ],
    }
  },
  pendingComponent: SitePending,
  component: PostPage,
})

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-14 heading-3 sm:text-3xl">{block.text}</h2>
    case "p":
      return (
        <p className="mt-5 text-lg leading-relaxed text-sand">
          <RichText text={block.text} />
        </p>
      )
    case "ul":
    case "ol": {
      const List = block.type
      return (
        <List
          className={
            block.type === "ol"
              ? "mt-5 list-decimal space-y-3 pl-6 text-lg leading-relaxed text-sand marker:text-gold"
              : "mt-5 list-disc space-y-3 pl-6 text-lg leading-relaxed text-sand marker:text-gold"
          }
        >
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </List>
      )
    }
    case "message":
      return (
        <figure className="mt-6 rounded-3xl border border-gold/15 bg-umber/50 px-6 py-5">
          <figcaption className="label">{block.label}</figcaption>
          <blockquote className="mt-3 text-base leading-relaxed whitespace-pre-line text-cream">
            {block.text}
          </blockquote>
        </figure>
      )
    case "tip":
      return (
        <p className="mt-6 rounded-3xl border border-gold/30 bg-gold/10 px-6 py-5 text-base leading-relaxed text-cream">
          <span className="mr-2 eyebrow">Tip</span>
          <RichText text={block.text} />
        </p>
      )
    case "image": {
      const size = (
        SHOTS as Partial<Record<string, { width: number; height: number }>>
      )[block.src]
      return (
        <figure className="mx-auto mt-8 max-w-xs">
          <img
            src={block.src}
            alt={block.alt}
            width={size?.width}
            height={size?.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-3xl border border-gold/20"
          />
          <figcaption className="mt-3 text-center text-sm text-sand">
            {block.caption}
          </figcaption>
        </figure>
      )
    }
    case "faq":
      return (
        <dl className="mt-6 grid gap-4">
          {block.items.map((item) => (
            <div
              key={item.q}
              className="rounded-3xl border border-gold/10 bg-umber/40 px-6 py-6 sm:px-8"
            >
              <dt className="font-display text-lg text-cream">{item.q}</dt>
              <dd className="mt-3 body-copy">
                <RichText text={item.a} />
              </dd>
            </div>
          ))}
        </dl>
      )
  }
}

function PostPage() {
  const { post, related } = Route.useLoaderData()
  const listing = post.category ? getListing(post.category) : undefined
  const templates = listing?.templates.slice(0, TEMPLATES_SHOWN) ?? []
  return (
    <SiteShell>
      <article className="mx-auto max-w-2xl px-4 pt-32 pb-16 sm:px-6 sm:pt-40">
        <Link to="/blog" className="inline-flex items-center gap-1 link">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Blog
        </Link>
        <p className="mt-8 label">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
          {post.readMinutes} min read
        </p>
        <h1 className="mt-4 heading-2">{post.title}</h1>
        <p className="mt-6 lead">{post.description}</p>

        <div className="mt-4">
          {post.blocks.map((block, index) => (
            <BlockView key={index} block={block} />
          ))}
        </div>

        <aside className="mt-16 rounded-[2rem] border border-gold/20 bg-[radial-gradient(ellipse_at_top,#3a2716_0%,#1a120c_60%,#110b07_100%)] px-6 py-12 text-center sm:px-12">
          <h2 className="heading-3 sm:text-3xl">
            Make an invitation with RSVP built in
          </h2>
          <p className="mx-auto mt-4 max-w-md body-copy">
            Pick a design, add your details and share one link. Free to start.
          </p>
          <BrandLink to="/templates" arrow className="mt-8">
            Choose a template
          </BrandLink>
        </aside>
      </article>

      {listing && templates.length > 0 && (
        <section
          aria-labelledby="templates-heading"
          className="mx-auto max-w-6xl border-t border-gold/10 px-4 py-16 sm:px-6"
        >
          <h2 id="templates-heading" className="text-center heading-3">
            {listing.page.linkLabel} to start from
          </h2>
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((meta) => (
              <li key={meta.id} className="mx-auto w-full max-w-sm">
                <TemplateCard meta={meta} />
              </li>
            ))}
          </ul>
          <p className="mt-10 text-center">
            <Link
              to="/templates/$category"
              params={{ category: listing.slug }}
              className="link"
            >
              See all {listing.page.linkLabel.toLowerCase()} →
            </Link>
          </p>
        </section>
      )}

      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="border-t border-gold/10 px-4 py-16 sm:px-6"
        >
          <h2 id="related-heading" className="text-center heading-3">
            More guides
          </h2>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-4">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: other.slug }}
                  className="group block rounded-3xl border border-gold/10 bg-umber/40 px-6 py-6 transition-colors duration-300 hover:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:px-8"
                >
                  <h3 className="font-display text-lg text-cream transition-colors duration-300 group-hover:text-gold-soft">
                    {other.title}
                  </h3>
                  <p className="mt-2 body-copy">{other.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="occasions-heading"
        className="border-t border-gold/10 px-4 py-16 sm:px-6"
      >
        <h2 id="occasions-heading" className="text-center heading-3">
          Invitations by occasion
        </h2>
        <OccasionLinks className="mt-8" />
      </section>
    </SiteShell>
  )
}
