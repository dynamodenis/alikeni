// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InvitationProvider } from "../context"
import { sampleInvitationConfig } from "../schema/sample"
import type { TemplateMode } from "../../types"
import type { Host } from "../schema"
import { Closing, Footer, madeWithHref } from "./Closing"

const footer = (mode: TemplateMode, locale: "en" | "id" = "en") =>
  renderToString(
    <InvitationProvider
      config={{ ...sampleInvitationConfig, locale }}
      mode={mode}
    >
      <Footer />
    </InvitationProvider>
  )

describe("invitation footer", () => {
  it("links to the template gallery, underlined and tagged for analytics", () => {
    const html = footer("public")
    expect(html).toContain(
      'href="/templates?utm_source=invitation&amp;utm_medium=referral&amp;utm_campaign=made_with&amp;utm_content=footer"'
    )
    expect(html).toContain("Made with Alikeni – create yours free")
    expect(html).toMatch(/class="[^"]*\bunderline\b[^"]*"/)
    expect(madeWithHref("rsvp")).toContain("utm_content=rsvp")
  })

  it("uses the invitation's language", () => {
    expect(footer("public", "id")).toContain(
      "Dibuat dengan Alikeni – buat undangan Anda, gratis"
    )
  })

  it("shows the same link in previews, without tracking tags", () => {
    const html = footer("preview")
    expect(html).toContain("Made with Alikeni – create yours free")
    expect(html).toContain('href="/templates"')
    expect(html).not.toContain("utm_")
  })
})

describe("closing signature", () => {
  const closing = (
    hosts: Array<Host>,
    type: "wedding" | "corporate" | "other" = "corporate"
  ) =>
    renderToString(
      <InvitationProvider
        config={{
          ...sampleInvitationConfig,
          hosts,
          event: { ...sampleInvitationConfig.event, type, title: "Build 2027" },
        }}
        mode="public"
      >
        <Closing />
      </InvitationProvider>
    )
  const speakers: Array<Host> = [
    { name: "Tunde", role: "other" },
    { name: "Halima", role: "other" },
  ]

  it("is signed by the organiser, not the speakers", () => {
    const html = closing([{ name: "Alikeni", role: "company" }, ...speakers])
    expect(html).toContain(">Alikeni<")
    expect(html).not.toContain("Tunde")
    expect(html).toContain("We look forward to welcoming you")
    expect(html).not.toContain("With love")
  })

  it("uses the event title when a corporate event lists only speakers", () => {
    const html = closing(speakers)
    expect(html).toContain(">Build 2027<")
    expect(html).not.toContain("Tunde")
  })

  it("keeps couples and committees as they were", () => {
    const html = closing(sampleInvitationConfig.hosts, "wedding")
    expect(html).toContain("With love")
    expect(html).toContain("Amara &amp; Kofi")
    expect(closing(speakers, "other")).toContain("Tunde &amp; Halima")
  })
})
