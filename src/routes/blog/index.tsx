import { Link, createFileRoute } from "@tanstack/react-router"
import { SiteShell } from "@/components/gallery/SiteShell"
import { Ornament } from "@/components/landing/InvitationCard"
import { POSTS, formatPostDate } from "@/blog/posts"
import { breadcrumbJsonLd, seo } from "@/lib/seo"

/** The blog index: every post in `src/blog/posts.ts`, newest first. */
export const Route = createFileRoute("/blog/")({
  head: () =>
    seo({
      title: "Invitation Tips and Guides · Alikeni Blog",
      description:
        "Practical guides for inviting guests: what to write, how to send invitations on WhatsApp, how to collect RSVPs and how to plan your guest list.",
      path: "/blog",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]),
      ],
    }),
  component: BlogIndex,
})

function BlogIndex() {
  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden px-4 pt-36 pb-10 sm:px-6 sm:pt-44">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(201,160,90,0.18),transparent_65%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Blog</p>
          <h1 className="mt-5 heading-1">
            Invitation tips and{" "}
            <span className="text-gold-gradient italic">guides</span>
          </h1>
          <Ornament className="mx-auto mt-7 w-32 text-gold/60" />
          <p className="mx-auto mt-7 max-w-xl lead">
            Short, practical guides for inviting guests and knowing who is
            coming.
          </p>
        </div>
      </section>

      <section
        aria-label="Posts"
        className="mx-auto max-w-3xl px-4 pt-6 pb-24 sm:px-6"
      >
        <ul className="grid gap-6">
          {POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group block rounded-3xl border border-gold/10 bg-umber/40 px-6 py-8 transition-colors duration-300 hover:border-gold/40 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none sm:px-10"
              >
                <article>
                  <p className="label">
                    <time dateTime={post.date}>
                      {formatPostDate(post.date)}
                    </time>{" "}
                    · {post.readMinutes} min read
                  </p>
                  <h2 className="mt-4 heading-3 transition-colors duration-300 group-hover:text-gold-soft">
                    {post.title}
                  </h2>
                  <p className="mt-3 body-copy">{post.description}</p>
                  <p className="mt-5 text-sm text-gold">Read the guide →</p>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  )
}
