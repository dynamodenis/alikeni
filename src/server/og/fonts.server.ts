// Fonts for the OG card, matched to the invitation's font pair. The card is
// drawn by satori 0.35 (the last build that runs on Cloudflare Workers, see
// docs/DEPLOY.md), which reads TTF, OTF and WOFF but not WOFF2 or variable
// fonts, so these are the static Fontsource packages at weight 400, Latin
// subset only. Each face is a lazy `?inline` import (a base64 data URL in its
// own chunk), so only the faces a card needs are ever loaded, and no `fs`.
import type { Font } from "satori/standalone"
import { DEFAULT_FONT_PAIR_ID } from "@/templates/_shared/theme/fonts"

type Loader = () => Promise<{ default: string }>

const FACES = {
  "baloo-2": () =>
    import("@fontsource/baloo-2/files/baloo-2-latin-400-normal.woff?inline"),
  "bebas-neue": () =>
    import("@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff?inline"),
  "bricolage-grotesque": () =>
    import("@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-400-normal.woff?inline"),
  cinzel: () =>
    import("@fontsource/cinzel/files/cinzel-latin-400-normal.woff?inline"),
  "cormorant-garamond": () =>
    import("@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff?inline"),
  "dancing-script": () =>
    import("@fontsource/dancing-script/files/dancing-script-latin-400-normal.woff?inline"),
  "dm-sans": () =>
    import("@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff?inline"),
  "eb-garamond": () =>
    import("@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff?inline"),
  fraunces: () =>
    import("@fontsource/fraunces/files/fraunces-latin-400-normal.woff?inline"),
  geist: () =>
    import("@fontsource/geist/files/geist-latin-400-normal.woff?inline"),
  "great-vibes": () =>
    import("@fontsource/great-vibes/files/great-vibes-latin-400-normal.woff?inline"),
  inter: () =>
    import("@fontsource/inter/files/inter-latin-400-normal.woff?inline"),
  lora: () =>
    import("@fontsource/lora/files/lora-latin-400-normal.woff?inline"),
  manrope: () =>
    import("@fontsource/manrope/files/manrope-latin-400-normal.woff?inline"),
  nunito: () =>
    import("@fontsource/nunito/files/nunito-latin-400-normal.woff?inline"),
  "playfair-display": () =>
    import("@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff?inline"),
  quicksand: () =>
    import("@fontsource/quicksand/files/quicksand-latin-400-normal.woff?inline"),
  "space-grotesk": () =>
    import("@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff?inline"),
} satisfies Record<string, Loader>

export type FaceId = keyof typeof FACES

/**
 * Display + body face per font pair id (see `FONT_PAIRS`). Montserrat,
 * Raleway and Josefin Sans are not installed as static faces; those three
 * use the closest face that is.
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
