// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { InvitationProvider } from "../context"
import { sampleInvitationConfig } from "../schema/sample"
import type { TemplateMode } from "../../types"
import { Footer } from "./Closing"

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
