// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InvitationProvider } from "../context"
import { sampleInvitationConfig } from "../schema/sample"
import type { TemplateMode } from "../../types"
import type { Host } from "../schema"
import { Closing, Footer } from "./Closing"

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
  it("invites guests to create their own invitation, tagged by source", () => {
    const html = footer("public")
    expect(html).toContain('href="/?ref=invite-footer"')
    expect(html).toContain("Create your own invitation, free")
  })

  it("uses the invitation's language", () => {
    expect(footer("public", "id")).toContain(
      "Buat undangan Anda sendiri, gratis"
    )
  })

  it("keeps only the plain credit in previews", () => {
    const html = footer("preview")
    expect(html).not.toContain("?ref=invite")
    expect(html).toContain("Alikeni")
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
