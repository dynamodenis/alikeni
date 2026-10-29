// Fonts for the OG card, matched to the invitation's font pair. Satori reads
// WOFF2 (and renders a variable font at its default instance), so the
// Fontsource packages the invitation pages already use serve here too: Latin
// subset only. Each face is a lazy `?inline` import (a base64 data URL in its
// own chunk), so only the faces a card needs are ever loaded, and no `fs`.
import type { Font } from "satori/standalone"
import { DEFAULT_FONT_PAIR_ID } from "@/templates/_shared/theme/fonts"

type Loader = () => Promise<{ default: string }>

const FACES = {
  "baloo-2": () =>
    import("@fontsource-variable/baloo-2/files/baloo-2-latin-wght-normal.woff2?inline"),
  "bebas-neue": () =>
    import("@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2?inline"),
  "bricolage-grotesque": () =>
    import("@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2?inline"),
  cinzel: () =>
    import("@fontsource-variable/cinzel/files/cinzel-latin-wght-normal.woff2?inline"),
  "cormorant-garamond": () =>
    import("@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2?inline"),
  "dancing-script": () =>
    import("@fontsource-variable/dancing-script/files/dancing-script-latin-wght-normal.woff2?inline"),
  "dm-sans": () =>
    import("@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?inline"),
  "eb-garamond": () =>
    import("@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2?inline"),
  fraunces: () =>
    import("@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2?inline"),
  geist: () =>
    import("@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?inline"),
  "great-vibes": () =>
    import("@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff2?inline"),
  inter: () =>
    import("@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline"),
  lora: () =>
    import("@fontsource-variable/lora/files/lora-latin-wght-normal.woff2?inline"),
  manrope: () =>
    import("@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?inline"),
  nunito: () =>
    import("@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2?inline"),
  "playfair-display": () =>
    import("@fontsource-variable/playfair-display/files/playfair-display-latin-wght-normal.woff2?inline"),
  quicksand: () =>
    import("@fontsource-variable/quicksand/files/quicksand-latin-wght-normal.woff2?inline"),
  "space-grotesk": () =>
    import("@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?inline"),
} satisfies Record<string, Loader>

export type FaceId = keyof typeof FACES

/**
 * Display + body face per font pair id (see `FONT_PAIRS`). Satori cannot pick
 * a weight from a variable font, and Montserrat, Raleway and Josefin Sans
 * default to Thin, which vanishes at thumbnail size; those three are swapped
 * for the closest face that defaults to a readable weight.
 */
export const OG_FONT_PAIRS: Record<string, { display: FaceId; body: FaceId }> =
  {
    "playfair-inter": { display: "playfair-display", body: "inter" },
    "cormorant-lora": { display: "cormorant-garamond", body: "lora" },
    "fraunces-dm-sans": { display: "fraunces", body: "dm-sans" },
    "cinzel-garamond": { display: "cinzel", body: "eb-garamond" },
    "great-vibes-raleway": { display: "great-vibes", body: "manrope" },
    "baloo-nunito": { display: "baloo-2", body: "nunito" },
    "bricolage-manrope": { display: "bricolage-grotesque", body: "manrope" },
    "bebas-montserrat": { display: "bebas-neue", body: "dm-sans" },
    "josefin-quicksand": { display: "quicksand", body: "quicksand" },
    "space-grotesk-inter": { display: "space-grotesk", body: "inter" },
    "dancing-lora": { display: "dancing-script", body: "lora" },
    geist: { display: "geist", body: "geist" },
  }

/** Family names the card's styles refer to. */
export const DISPLAY_FAMILY = "OG Display"
export const BODY_FAMILY = "OG Body"

const bytes = new Map<FaceId, Promise<ArrayBuffer>>()

function loadFace(id: FaceId): Promise<ArrayBuffer> {
  let pending = bytes.get(id)
  if (!pending) {
    pending = FACES[id]()
      .then(async (module) => (await fetch(module.default)).arrayBuffer())
      .catch((error: unknown) => {
        bytes.delete(id)
        throw error
      })
    bytes.set(id, pending)
  }
  return pending
}

export function facesFor(fontPairId: string) {
  return OG_FONT_PAIRS[fontPairId] ?? OG_FONT_PAIRS[DEFAULT_FONT_PAIR_ID]
}

/** Satori font list for a font pair; unknown ids fall back to the default pair. */
export async function loadOgFonts(fontPairId: string): Promise<Font[]> {
  const faces = facesFor(fontPairId)
  const [display, body] = await Promise.all([
    loadFace(faces.display),
    loadFace(faces.body),
  ])
  return [
    { name: DISPLAY_FAMILY, data: display, weight: 400, style: "normal" },
    { name: BODY_FAMILY, data: body, weight: 400, style: "normal" },
  ]
}
