import { describe, expect, it } from "vitest"
import { PreviewMessage } from "./preview-bridge"

describe("PreviewMessage", () => {
  it("accepts theme overrides and ready pings", () => {
    expect(
      PreviewMessage.safeParse({ type: "alikeni:theme", paletteId: "sage" })
        .success
    ).toBe(true)
    expect(
      PreviewMessage.safeParse({
        type: "alikeni:ready",
        templateId: "wedding/ivory-garden",
      }).success
    ).toBe(true)
  })

  it("rejects unknown types and bad values", () => {
    expect(
      PreviewMessage.safeParse({ type: "alikeni:eval", code: "x" }).success
    ).toBe(false)
    expect(
      PreviewMessage.safeParse({ type: "alikeni:theme", motionLevel: "warp" })
        .success
    ).toBe(false)
    expect(PreviewMessage.safeParse("alikeni:theme").success).toBe(false)
  })
})
