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
import { meta as dinoAdventure } from "./birthday/dino-adventure/meta"
import { meta as princessCastle } from "./birthday/princess-castle/meta"
import { meta as neonNight } from "./birthday/neon-night/meta"
import { meta as retroArcade } from "./birthday/retro-arcade/meta"
import { meta as goldenMilestone } from "./birthday/golden-milestone/meta"
import { meta as sweetSeventeen } from "./birthday/sweet-seventeen/meta"
import { meta as gardenTeaParty } from "./birthday/garden-tea-party/meta"
import { meta as chalkboard } from "./graduation/chalkboard/meta"
import { meta as varsity } from "./graduation/varsity/meta"
import { meta as techTerminal } from "./graduation/tech-terminal/meta"
import { meta as starryFuture } from "./graduation/starry-future/meta"
import { meta as polaroidMemories } from "./graduation/polaroid-memories/meta"

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
  dinoAdventure,
  princessCastle,
  neonNight,
  retroArcade,
  goldenMilestone,
  sweetSeventeen,
  gardenTeaParty,
  chalkboard,
  varsity,
  techTerminal,
  starryFuture,
  polaroidMemories,
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
  "graduation/polaroid-memories": () => import("./graduation/polaroid-memories"),
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
