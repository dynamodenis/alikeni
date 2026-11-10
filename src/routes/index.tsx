import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/components/landing/LandingPage"
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
  component: LandingPage,
})
