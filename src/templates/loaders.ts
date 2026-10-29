import type { TemplateModule } from "./types"

/**
 * Lazy template loaders, kept apart from the metadata in `registry.ts` so a
 * page that renders one invitation does not download all fifty metas. The
 * generator (`pnpm gen:template`) adds an entry here and in `registry.ts`.
 */
type Loader = () => Promise<{ default: TemplateModule }>

const loaders: Partial<Record<string, Loader>> = {
  "wedding/ivory-garden": () => import("./wedding/ivory-garden"),
  "birthday/confetti-pop": () => import("./birthday/confetti-pop"),
  "graduation/cap-and-gown": () => import("./graduation/cap-and-gown"),
  "wedding/midnight-aurora": () => import("./wedding/midnight-aurora"),
  "wedding/javanese-heritage": () => import("./wedding/javanese-heritage"),
  "wedding/minimal-mono": () => import("./wedding/minimal-mono"),
  "wedding/rustic-barn": () => import("./wedding/rustic-barn"),
  "wedding/boho-terracotta": () => import("./wedding/boho-terracotta"),
  "wedding/royal-islamic": () => import("./wedding/royal-islamic"),
  "wedding/beach-sunset": () => import("./wedding/beach-sunset"),
  "wedding/cinema-reel": () => import("./wedding/cinema-reel"),
  "wedding/pastel-petals": () => import("./wedding/pastel-petals"),
  "birthday/dino-adventure": () => import("./birthday/dino-adventure"),
  "birthday/princess-castle": () => import("./birthday/princess-castle"),
  "birthday/neon-night": () => import("./birthday/neon-night"),
  "birthday/retro-arcade": () => import("./birthday/retro-arcade"),
  "birthday/golden-milestone": () => import("./birthday/golden-milestone"),
  "birthday/sweet-seventeen": () => import("./birthday/sweet-seventeen"),
  "birthday/garden-tea-party": () => import("./birthday/garden-tea-party"),
  "graduation/chalkboard": () => import("./graduation/chalkboard"),
  "graduation/varsity": () => import("./graduation/varsity"),
  "graduation/tech-terminal": () => import("./graduation/tech-terminal"),
  "graduation/starry-future": () => import("./graduation/starry-future"),
  "graduation/polaroid-memories": () =>
    import("./graduation/polaroid-memories"),
  "baby_shower/cloud-nine": () => import("./baby_shower/cloud-nine"),
  "baby_shower/little-safari": () => import("./baby_shower/little-safari"),
  "baby_shower/gender-reveal": () => import("./baby_shower/gender-reveal"),
  "baby_shower/twinkle-star": () => import("./baby_shower/twinkle-star"),
  "baby_shower/botanical-sage": () => import("./baby_shower/botanical-sage"),
  "baby_shower/teddy-picnic": () => import("./baby_shower/teddy-picnic"),
  "anniversary/golden-years": () => import("./anniversary/golden-years"),
  "anniversary/silver-jubilee": () => import("./anniversary/silver-jubilee"),
  "anniversary/love-letter": () => import("./anniversary/love-letter"),
  "anniversary/then-and-now": () => import("./anniversary/then-and-now"),
  "anniversary/vinyl-love-song": () => import("./anniversary/vinyl-love-song"),
  "corporate/product-launch": () => import("./corporate/product-launch"),
  "corporate/black-tie-gala": () => import("./corporate/black-tie-gala"),
  "corporate/conference-grid": () => import("./corporate/conference-grid"),
  "corporate/holiday-party": () => import("./corporate/holiday-party"),
  "corporate/team-offsite": () => import("./corporate/team-offsite"),
  "corporate/webinar-minimal": () => import("./corporate/webinar-minimal"),
  "other/engagement-sparkle": () => import("./other/engagement-sparkle"),
  "other/khitanan-ceria": () => import("./other/khitanan-ceria"),
  "other/aqiqah-soft": () => import("./other/aqiqah-soft"),
  "other/housewarming-keys": () => import("./other/housewarming-keys"),
  "other/bridal-shower-blush": () => import("./other/bridal-shower-blush"),
  "other/retirement-sunset": () => import("./other/retirement-sunset"),
  "other/eid-open-house": () => import("./other/eid-open-house"),
  "other/christmas-dinner": () => import("./other/christmas-dinner"),
  "other/class-reunion": () => import("./other/class-reunion"),
}

export const TEMPLATE_IDS: ReadonlyArray<string> = Object.keys(loaders)

export function hasTemplate(id: string): boolean {
  return Object.hasOwn(loaders, id)
}

const cache = new Map<string, Promise<TemplateModule>>()

/** Resolve a template module once; later calls share the same promise. */
export function loadTemplate(id: string): Promise<TemplateModule> {
  const loader = loaders[id]
  if (!loader) {
    return Promise.reject(new Error(`Unknown template "${id}"`))
  }
  let pending = cache.get(id)
  if (!pending) {
    pending = loader().then((m) => m.default)
    cache.set(id, pending)
  }
  return pending
}
