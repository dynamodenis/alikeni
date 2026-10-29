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
import { meta as cloudNine } from "./baby_shower/cloud-nine/meta"
import { meta as littleSafari } from "./baby_shower/little-safari/meta"
import { meta as genderReveal } from "./baby_shower/gender-reveal/meta"
import { meta as twinkleStar } from "./baby_shower/twinkle-star/meta"
import { meta as botanicalSage } from "./baby_shower/botanical-sage/meta"
import { meta as teddyPicnic } from "./baby_shower/teddy-picnic/meta"
import { meta as goldenYears } from "./anniversary/golden-years/meta"
import { meta as silverJubilee } from "./anniversary/silver-jubilee/meta"
import { meta as loveLetter } from "./anniversary/love-letter/meta"
import { meta as thenAndNow } from "./anniversary/then-and-now/meta"
import { meta as vinylLoveSong } from "./anniversary/vinyl-love-song/meta"
import { meta as productLaunch } from "./corporate/product-launch/meta"
import { meta as blackTieGala } from "./corporate/black-tie-gala/meta"
import { meta as conferenceGrid } from "./corporate/conference-grid/meta"
import { meta as holidayParty } from "./corporate/holiday-party/meta"
import { meta as teamOffsite } from "./corporate/team-offsite/meta"
import { meta as webinarMinimal } from "./corporate/webinar-minimal/meta"
import { meta as engagementSparkle } from "./other/engagement-sparkle/meta"
import { meta as khitananCeria } from "./other/khitanan-ceria/meta"
import { meta as aqiqahSoft } from "./other/aqiqah-soft/meta"
import { meta as housewarmingKeys } from "./other/housewarming-keys/meta"
import { meta as bridalShowerBlush } from "./other/bridal-shower-blush/meta"
import { meta as retirementSunset } from "./other/retirement-sunset/meta"
import { meta as eidOpenHouse } from "./other/eid-open-house/meta"
import { meta as christmasDinner } from "./other/christmas-dinner/meta"
import { meta as classReunion } from "./other/class-reunion/meta"

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
  cloudNine,
  littleSafari,
  genderReveal,
  twinkleStar,
  botanicalSage,
  teddyPicnic,
  goldenYears,
  silverJubilee,
  loveLetter,
  thenAndNow,
  vinylLoveSong,
  productLaunch,
  blackTieGala,
  conferenceGrid,
  holidayParty,
  teamOffsite,
  webinarMinimal,
  engagementSparkle,
  khitananCeria,
  aqiqahSoft,
  housewarmingKeys,
  bridalShowerBlush,
  retirementSunset,
  eidOpenHouse,
  christmasDinner,
  classReunion,
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
