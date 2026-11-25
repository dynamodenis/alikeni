import { Link } from "@tanstack/react-router"
import type { PostSummary } from "@/blog/types"

/**
 * A short row of blog posts with a link to the blog. The posts come from the
 * page's loader (`guidesFor`), so article text never rides along.
 */
export function GuideLinks({
  heading,
  posts,
}: {
  heading: string
  posts: ReadonlyArray<PostSummary>
}) {
  if (posts.length === 0) return null
  return (
    <section
      aria-labelledby="guides-heading"
      className="border-t border-gold/10 px-4 py-16 sm:px-6"
    >
      <h2 id="guides-heading" className="text-center heading-3">
        {heading}
      </h2>
      <ul className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/blog/$slug"
              params={{ slug: post.slug }}
              className="group flex h-full flex-col rounded-3xl border border-gold/10 bg-umber/40 px-6 py-6 transition-colors duration-300 hover:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <h3 className="font-display text-lg text-cream transition-colors duration-300 group-hover:text-gold-soft">
                {post.title}
              </h3>
              <p className="mt-3 text-sm text-gold">Read the guide →</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <Link to="/blog" className="link">
          All guides →
        </Link>
      </p>
    </section>
  )
}
