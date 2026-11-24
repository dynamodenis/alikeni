import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/components/landing/LandingPage"
import { priceCurrencies } from "@/lib/plans"
import { visitorCountry } from "@/server/geo/visitor-country.functions"
import {
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
      jsonLd: [organizationJsonLd, websiteJsonLd, webApplicationJsonLd],
    }),
  // Which prices to show: read from the request while rendering, so it
  // costs no call. Kept for the visit so the prices do not change under
  // someone who comes back to this page.
  loader: () => ({ currencies: priceCurrencies(visitorCountry()) }),
  staleTime: Infinity,
  component: Home,
})

function Home() {
  const { currencies } = Route.useLoaderData()
  return <LandingPage currencies={currencies} />
}
