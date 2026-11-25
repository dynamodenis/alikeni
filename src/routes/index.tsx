import { createFileRoute } from "@tanstack/react-router"
import { HOME_QUESTIONS } from "@/components/landing/HomeFaq"
import { LandingPage } from "@/components/landing/LandingPage"
import { priceCurrencies } from "@/lib/plans"
import { visitorCountry } from "@/server/geo/visitor-country.functions"
import {
  faqJsonLd,
  organizationJsonLd,
  seo,
  webApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo"

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Alikeni: Online Invitation Maker with RSVP",
      description:
        "Create a beautiful invitation website for your wedding, birthday or any event. RSVP, countdown, map, music and guest wishes built in. Free to start.",
      path: "/",
      imageAlt: "Alikeni, online invitations with RSVP",
      jsonLd: [
        organizationJsonLd,
        websiteJsonLd,
        webApplicationJsonLd,
        faqJsonLd(HOME_QUESTIONS),
      ],
    }),
  // Which prices to show: read from the request while rendering, so it
  // costs no call. Kept for the visit so the prices do not change under
  // someone who comes back to this page.
  // Posts are imported lazily so the articles stay out of the entry chunk.
  loader: async () => {
    const currencies = priceCurrencies(visitorCountry())
    const { guidesFor } = await import("@/blog/posts")
    return { currencies, guides: guidesFor() }
  },
  staleTime: Infinity,
  component: Home,
})

function Home() {
  const { currencies, guides } = Route.useLoaderData()
  return <LandingPage currencies={currencies} guides={guides} />
}
