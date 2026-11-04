import { describe, expect, it } from "vitest"
import {
  TEXT_CONTRAST,
  accessibleTokens,
  ensureTextContrast,
  mixOklab,
  textBackgrounds,
} from "./accessible"
import { contrastRatio } from "./contrast"
import { PALETTES, resolvePalette } from "./palettes"

const ratio = (a: string, b: string) => contrastRatio(a, b) ?? 0

describe("accessible tokens", () => {
  it.each(PALETTES.map((p) => [p.id, p] as const))(
    "%s: primary and muted read as small text on every band",
    (_id, palette) => {
      const tokens = accessibleTokens(palette)
      const bands = textBackgrounds(palette)
      for (const bg of [...bands.plain, ...bands.tint, ...bands.surface]) {
        expect(ratio(tokens.primary, bg)).toBeGreaterThanOrEqual(4.5)
      }
      for (const tone of ["plain", "tint", "surface"] as const) {
        for (const bg of bands[tone]) {
          expect(ratio(tokens.muted[tone], bg)).toBeGreaterThanOrEqual(4.5)
        }
      }
    }
  )

  it("leaves a primary that already passes untouched", () => {
    expect(ensureTextContrast("#1a1a1a", ["#ffffff"], "light")).toBe("#1a1a1a")
  })

  it("darkens on light palettes and lightens on dark ones", () => {
    const light = ensureTextContrast("#c9a05a", ["#fffaf0"], "light")
    expect(ratio(light, "#fffaf0")).toBeGreaterThanOrEqual(TEXT_CONTRAST)
    expect(ratio(light, "#000000")).toBeLessThan(ratio("#c9a05a", "#000000"))
    const dark = ensureTextContrast("#6b4fa0", ["#0b0b1a"], "dark")
    expect(ratio(dark, "#0b0b1a")).toBeGreaterThanOrEqual(TEXT_CONTRAST)
  })

  it("mixes like CSS color-mix in oklab", () => {
    expect(mixOklab("#000000", "#ffffff", 0)).toBe("#ffffff")
    expect(mixOklab("#000000", "#ffffff", 1)).toBe("#000000")
    // Oklab L 0.5 between black and white is a mid grey (#636363).
    expect(mixOklab("#000000", "#ffffff", 0.5)).toBe("#636363")
  })

  it("handles custom oklch palettes", () => {
    const palette = resolvePalette({
      paletteId: "ivory-gold",
      custom: {
        primary: "oklch(0.8 0.1 80)",
        secondary: "oklch(0.95 0.03 80)",
        accent: "oklch(0.7 0.1 30)",
        background: "oklch(0.99 0.01 80)",
        foreground: "oklch(0.2 0.02 80)",
      },
    })
    const tokens = accessibleTokens(palette)
    expect(ratio(tokens.primary, palette.background)).toBeGreaterThanOrEqual(
      4.5
    )
  })
})
