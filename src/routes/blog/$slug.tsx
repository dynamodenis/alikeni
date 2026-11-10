import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { BrandLink } from "@/components/brand/ButtonLink"
import { SiteShell } from "@/components/gallery/SiteShell"
import { OccasionLinks } from "@/components/landing/OccasionLinks"
import { formatPostDate, getPost, type Block } from "@/blog/posts"
import { articleJsonLd, breadcrumbJsonLd, seo } from "@/lib/seo"

/** One blog post, `/blog/<slug>` (content in `src/blog/posts.ts`). */
export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug)
    if (!post) throw notFound()
    return { post }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Blog · Alikeni" }] }
    const { post } = loaderData
    const path = `/blog/${post.slug}`
    const head = seo({
      title: `${post.title} · Alikeni`,
      description: post.description,
      path,
      jsonLd: [
        articleJsonLd({ ...post, path }),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ]),
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
      ],
    }
  },
  component: PostPage,
})

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return <h2 className="mt-14 heading-3 sm:text-3xl">{block.text}</h2>
    case "p":
      return (
        <p className="mt-5 text-lg leading-relaxed text-sand">{block.text}</p>
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
            <li key={item}>{item}</li>
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
          {block.text}
        </p>
      )
  }
}

function PostPage() {
  const { post } = Route.useLoaderData()
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
