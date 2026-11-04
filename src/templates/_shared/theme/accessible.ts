/**
 * Contrast-safe text tokens.
 *
 * Palettes are designed as brand colors: `primary` only has to clear 3:1
 * against the background (large text), and `styles.css` derives `--inv-muted`
 * as a 62 % mix of foreground into the local background. On small text
 * (eyebrows, labels, captions, outline buttons) both can fall under WCAG AA
 * 4.5:1, especially on the tinted bands and the surface cards inside them.
 *
 * These helpers nudge only what is needed: `primary` keeps its hue and chroma
 * and moves in OKLCH lightness away from the backgrounds; `muted` takes a
 * larger share of foreground. Both are checked against every background a
 * block can sit on (plain, surface, tint band, and the cards inside each).
 * Mixing replicates CSS `color-mix(in oklab, …)` so the numbers match the
 * browser's.
 */
import { contrastRatio, parseColor } from "./contrast"
import type { Palette } from "./palettes"

type Oklab = [number, number, number]

/** Target with a little headroom over 4.5 so rounding never tips a check. */
export const TEXT_CONTRAST = 4.6

/** Mix shares from styles.css (kept in one place here). */
const TINT_SECONDARY = 0.42
const SURFACE_FG = 0.04
const MUTED_FG = 0.62

function linearToOklab([r, g, b]: [number, number, number]): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear([L, a, b]: Oklab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function toOklab(color: string): Oklab | null {
  const rgb = parseColor(color)
  return rgb ? linearToOklab(rgb) : null
}

function toHex(lab: Oklab): string {
  const encode = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  return (
    "#" +
    oklabToLinear(lab)
      .map((c) =>
        Math.round(encode(c) * 255)
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  )
}

/** CSS `color-mix(in oklab, a share, b)` as hex. */
export function mixOklab(a: string, b: string, share: number): string | null {
  const x = toOklab(a)
  const y = toOklab(b)
  if (!x || !y) return null
  return toHex([
    x[0] * share + y[0] * (1 - share),
    x[1] * share + y[1] * (1 - share),
    x[2] * share + y[2] * (1 - share),
  ])
}

const minContrast = (color: string, backgrounds: ReadonlyArray<string>) =>
  Math.min(...backgrounds.map((bg) => contrastRatio(color, bg) ?? 21))

/** The page background, the tinted band and the surface cards on each. */
export function textBackgrounds(palette: Palette): {
  plain: Array<string>
  tint: Array<string>
  surface: Array<string>
} {
  const { background: bg, foreground: fg, secondary } = palette
  const tint = mixOklab(secondary, bg, TINT_SECONDARY) ?? bg
  const surface = mixOklab(fg, bg, SURFACE_FG) ?? bg
  const card = (band: string) => mixOklab(fg, band, SURFACE_FG) ?? band
  return {
    plain: [bg, card(bg)],
    tint: [tint, card(tint)],
    surface: [surface, card(surface)],
  }
}

/**
 * `color` itself when it already reaches `TEXT_CONTRAST` on every background;
 * otherwise the nearest color of the same hue and chroma (OKLCH lightness
 * moved away from the backgrounds) that does.
 */
export function ensureTextContrast(
  color: string,
  backgrounds: ReadonlyArray<string>,
  mode: Palette["mode"]
): string {
  if (minContrast(color, backgrounds) >= TEXT_CONTRAST) return color
  const lab = toOklab(color)
  if (!lab) return color
  const step = mode === "dark" ? 0.01 : -0.01
  const [, a, b] = lab
  for (let L = lab[0] + step; L > 0 && L < 1; L += step) {
    const candidate = toHex([L, a, b])
    if (minContrast(candidate, backgrounds) >= TEXT_CONTRAST) return candidate
  }
  return mode === "dark" ? "#ffffff" : "#000000"
}

/** Smallest foreground share (from the stylesheet's 62 %) that reads on `backgrounds`. */
export function mutedFor(
  palette: Palette,
  backgrounds: ReadonlyArray<string>
): string {
  for (let share = MUTED_FG; share < 1; share += 0.02) {
    const muted = mixOklab(palette.foreground, backgrounds[0], share)
    if (muted && minContrast(muted, backgrounds) >= TEXT_CONTRAST) return muted
  }
  return palette.foreground
}

export type AccessibleTokens = {
  /** `--inv-primary`, readable as small text on every band. */
  primary: string
  /** `--inv-muted` per band tone. */
  muted: { plain: string; tint: string; surface: string }
}

const cache = new Map<string, AccessibleTokens>()

export function accessibleTokens(palette: Palette): AccessibleTokens {
  const key = [
    palette.primary,
    palette.secondary,
    palette.background,
    palette.foreground,
    palette.mode,
  ].join("|")
  const hit = cache.get(key)
  if (hit) return hit
  const bands = textBackgrounds(palette)
  const tokens: AccessibleTokens = {
    primary: ensureTextContrast(
      palette.primary,
      [...bands.plain, ...bands.tint, ...bands.surface],
      palette.mode
    ),
    muted: {
      plain: mutedFor(palette, bands.plain),
      tint: mutedFor(palette, bands.tint),
      surface: mutedFor(palette, bands.surface),
    },
  }
  if (cache.size > 200) cache.clear() // custom palettes edited live
  cache.set(key, tokens)
  return tokens
}
