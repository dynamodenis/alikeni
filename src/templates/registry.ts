import type { TemplateMeta, TemplateModule } from "./types"
import { meta as ivoryGarden } from "./wedding/ivory-garden/meta"
import { meta as confettiPop } from "./birthday/confetti-pop/meta"
import { meta as capAndGown } from "./graduation/cap-and-gown/meta"
import { meta as midnightAurora } from "./wedding/midnight-aurora/meta"
import { meta as javaneseHeritage } from "./wedding/javanese-heritage/meta"
import { meta as minimalMono } from "./wedding/minimal-mono/meta"
import { meta as rusticBarn } from "./wedding/rustic-barn/meta"
import { meta as bohoTerracotta } from "./wedding/boho-terracotta/meta"
import { meta as royalIslamic } from "./wedding/royal-islamic/meta"
import { meta as beachSunset } from "./wedding/beach-sunset/meta"
import { meta as cinemaReel } from "./wedding/cinema-reel/meta"
import { meta as pastelPetals } from "./wedding/pastel-petals/meta"

/**
 * Synchronous metadata for galleries and listings. Template code itself is
 * lazy-loaded through `loadTemplate` so a page only ships the template it
 * renders.
 */
export const TEMPLATE_METAS: ReadonlyArray<TemplateMeta> = [
  ivoryGarden,
  confettiPop,
  capAndGown,
  midnightAurora,
  javaneseHeritage,
  minimalMono,
  rusticBarn,
  bohoTerracotta,
  royalIslamic,
  beachSunset,
  cinemaReel,
  pastelPetals,
]

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
}

export const TEMPLATE_IDS: ReadonlyArray<string> = Object.keys(loaders)

export function hasTemplate(id: string): boolean {
  return Object.hasOwn(loaders, id)
}

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATE_METAS.find((m) => m.id === id)
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
