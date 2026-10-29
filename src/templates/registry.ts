import type { TemplateMeta } from "./types"
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

export { TEMPLATE_IDS, hasTemplate, loadTemplate } from "./loaders"

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

export function getTemplateMeta(id: string): TemplateMeta | undefined {
  return TEMPLATE_METAS.find((m) => m.id === id)
}
