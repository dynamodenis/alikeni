// Copy for the template pages (/templates/<category>/<slug>): who each design
// is for and how its sample is set up, in words no other template page has.
// Without it the fifty pages differ by one sentence and search engines treat
// them as copies of each other. A test requires an entry for every template.
import { CATEGORY_LABELS } from "./catalog"
import type { TemplateMeta } from "./types"

export type TemplatePage = {
  /**
   * The occasion named in titles and labels when the category label does not
   * say it ("Other" → "Housewarming"). Omit to use the category label.
   */
  occasion?: string
  /** Two or three sentences shown under "About this template". */
  about: string
}

export const TEMPLATE_PAGES: Partial<Record<string, TemplatePage>> = {
  "wedding/ivory-garden": {
    about:
      "Ivory Garden is for a classic church or garden wedding where the invitation should feel like printed stationery. The sample sets the day out as two events with their own times, tells the couple's story in three steps and shows six photos. Change the wording and it serves an engagement party or an anniversary just as well.",
  },
  "wedding/midnight-aurora": {
    about:
      "Midnight Aurora is made for an evening or black-tie wedding. The dark sky and thin lettering read best with few words, so keep the headline to the two names and let the countdown and schedule do the rest. The sample has two events, a three-step story and six photos, and the same layout suits an engagement dinner.",
  },
  "wedding/javanese-heritage": {
    occasion: "Javanese Wedding",
    about:
      "Javanese Heritage is for a traditional Javanese wedding, with batik bands in sogan brown and a wax-seal crest for the couple's initials. The sample text is written in Bahasa Indonesia, including the parents' lines and the formal greeting, and the dates follow Indonesian format. Switch the invitation language to English in the editor if you prefer.",
  },
  "wedding/minimal-mono": {
    about:
      "Minimal Mono is for couples who want no decoration at all: black and white, one large headline and thin rules. It has no background effects or motion, so it loads quickly and stays easy to read on any phone. Pick another palette to add a single accent colour without changing the layout.",
  },
  "wedding/rustic-barn": {
    about:
      "Rustic Barn suits a farm, barn or countryside wedding. Photos sit slightly tilted, like prints pinned to a board, so casual and outdoor pictures look at home in it. The sample has two events, a three-step story and six photos, and the kraft-paper look works for an engagement party or an anniversary too.",
  },
  "wedding/boho-terracotta": {
    about:
      "Boho Terracotta is for a relaxed outdoor or desert wedding in warm, earthy colours. Portraits sit in arches and the gallery is a carousel guests swipe through, so it works well when you have a small set of good photos. The sample has two events and a three-step story.",
  },
  "wedding/royal-islamic": {
    occasion: "Islamic Wedding",
    about:
      "Royal Islamic is for a nikah or walima. The headline opens with a Bismillah line, portraits sit in mihrab arches and the seal is captioned Nikah. The sample lists two events, so you can give the nikah and the walima their own time and venue, and guests can save both to their calendar.",
  },
  "wedding/beach-sunset": {
    about:
      "Beach Sunset is for a beach or destination wedding. The countdown is a ring and the photos swipe past in a carousel of rounded cards. Guests travelling to a destination wedding rely on the map and directions links, so fill in the venue notes with parking or transfer details.",
  },
  "wedding/cinema-reel": {
    about:
      "Cinema Reel turns the wedding into a film premiere: the couple's names become a poster title, the cover carries an admit-one ticket and the schedule reads as showtimes. It suits couples who love film and want an invitation with some humour. Your first photos appear on a strip of 35 mm film.",
  },
  "wedding/pastel-petals": {
    about:
      "Pastel Petals is a soft, romantic design for a spring or garden wedding, with blush petals drifting over the cover and round portraits. The sample has two events, a three-step story and six photos. The gentle colours also suit an engagement party or an anniversary lunch.",
  },
  "birthday/confetti-pop": {
    about:
      "Confetti Pop is a bright children's birthday invitation. The age sits on a sticker badge that you set in the editor, so the same design works for a first birthday or a tenth. The sample has two parts to the party, four photos in a swipeable carousel and a ring countdown.",
  },
  "birthday/dino-adventure": {
    about:
      "Dino Adventure is for a dinosaur or jungle party. The child's age hatches out of a spotted egg, and you set that number in the editor. The sample plans the party in three parts, which is handy for listing arrival, games and cake so parents know when to collect.",
  },
  "birthday/princess-castle": {
    about:
      "Princess Castle is a fairytale birthday invitation with a castle crest, sparkles and a script headline. Set the age in the editor and list the party in up to three parts, as the sample does. If guests should come in costume, say so in the dress code line.",
  },
  "birthday/neon-night": {
    about:
      "Neon Night is for an adult birthday that starts after dark: an 18th, a 21st or a club night. The age glows as a neon sign, and you choose the number. The sample splits the night into three parts, useful when dinner, the party and the after-party are in different places.",
  },
  "birthday/retro-arcade": {
    about:
      "Retro Arcade is an 8-bit birthday invitation for anyone who grew up with game consoles. The age shows as a high score on a scoreboard, so it suits a 30th or 40th as well as a gaming party for a teenager. Set the age in the editor; the sample has three parts and six photos.",
  },
  "birthday/golden-milestone": {
    about:
      "Golden Milestone is a formal invitation for a big birthday such as a 50th, 60th or 70th. Unlike the other birthday designs it includes a story section, shown as milestones by decade, so family can tell a life in six steps. A rosette seal carries the age, which you set in the editor.",
  },
  "birthday/sweet-seventeen": {
    occasion: "Sweet Seventeen",
    about:
      "Sweet Seventeen is for a 17th birthday, with the celebrant's portrait on a split cover and photos in a swipeable carousel. The age on the badge is editable, so it works equally for a sweet sixteen or an 18th. The sample plans the party in three parts.",
  },
  "birthday/garden-tea-party": {
    about:
      "Garden Tea Party is a calm, vintage design for an afternoon tea, often for a parent's or grandparent's birthday. The guest of honour gets a portrait on the cover and a short introduction. Set the age in the editor; the sample is an 80th with three parts to the afternoon.",
  },
  "graduation/cap-and-gown": {
    about:
      "Cap & Gown is a formal graduation invitation in navy and gold. A diploma card shows the school, the degree and the class year, all of which you fill in. The sample has two events and four milestones, a good fit for a university graduation with a ceremony and a family dinner.",
  },
  "graduation/chalkboard": {
    about:
      "Chalkboard is a playful design for a high school or primary school graduation, drawn like a classroom board. The wishes section becomes a board for guests to sign, a nice keepsake after the party. Fill in the school, the course and the class year; the sample plans three parts to the day.",
  },
  "graduation/varsity": {
    about:
      "Varsity is styled on a letterman jacket, with stripes and the graduate's initial on a stitched patch. It suits a college or university graduate, especially one who played a sport. Fill in the school, the degree and the class year; the sample has three events and four milestones.",
  },
  "graduation/tech-terminal": {
    about:
      "Tech Terminal is for a computer science, engineering or IT graduate. The cover types the graduate's name at a command prompt and the sections are named like files. Fill in the school, the degree and the class year. It also works for a developer meetup or a hackathon.",
  },
  "graduation/starry-future": {
    about:
      "Starry Future looks ahead: a constellation crest, a night sky and a journey timeline that alternates left and right. Use the four milestones for the years of study or for what comes next. Fill in the school, the degree and the class year; the sample has two events.",
  },
  "graduation/polaroid-memories": {
    about:
      "Polaroid Memories puts photos first: the graduate's portrait hangs in a Polaroid frame and the gallery is a wall of tilted prints. Choose it when you have plenty of pictures from the school years. Fill in the school, the degree and the class year; it also suits a birthday.",
  },
  "baby_shower/cloud-nine": {
    about:
      "Cloud Nine is a gentle baby shower invitation in sky blue that works for a boy, a girl or a surprise. The sample introduces both parents and the baby, plans the shower in two parts and shows six photos. Guests can leave messages for the parents on the wishes wall.",
  },
  "baby_shower/little-safari": {
    about:
      "Little Safari is for a safari or animal-themed baby shower, with bunting and an acacia sun badge. The sample plans three parts to the afternoon and introduces both parents and the baby. Change the wording and it also makes a good first birthday invitation.",
  },
  "baby_shower/gender-reveal": {
    occasion: "Gender Reveal",
    about:
      "Gender Reveal is built around the moment of the announcement: a half-pink, half-blue question mark and a ring that counts down to it. The sample plans three parts, so you can put the reveal at a set time and tell guests when to arrive. It has no gifts section.",
  },
  "baby_shower/twinkle-star": {
    about:
      "Twinkle Star is a night-sky baby shower invitation with a crescent moon and a gold headline. The dark background suits an evening shower and looks good in navy with gold. The sample has two parts and six photos, and the design also works for a first birthday.",
  },
  "baby_shower/botanical-sage": {
    about:
      "Botanical Sage is a calm, natural design in sage green that is not tied to pink or blue. Portraits sit in arches and the photos form a tilting mosaic. The sample plans the shower in three parts, a good fit for a garden or greenhouse lunch.",
  },
  "baby_shower/teddy-picnic": {
    about:
      "Teddy Picnic is for an outdoor or picnic baby shower, with a stitched bear crest and a gingham blanket strip. The sample plans three parts to the picnic. Use the venue notes to tell guests what to bring; the design also suits a toddler's birthday.",
  },
  "anniversary/golden-years": {
    occasion: "Golden Anniversary",
    about:
      "Golden Years is made for a 50th wedding anniversary. The story section runs as five milestones, one for each decade, and a foil seal carries the number of years. You can change that number, so the design also serves a 40th or a 60th. The sample has two events.",
  },
  "anniversary/silver-jubilee": {
    occasion: "Silver Anniversary",
    about:
      "Silver Jubilee is for a 25th wedding anniversary, in silver with a monogram crest. The sample is a single celebration with no separate schedule, plus a four-step story and six photos. The years on the badge are editable if you are marking a different anniversary.",
  },
  "anniversary/love-letter": {
    about:
      "Love Letter shows your invitation text as a handwritten letter signed with both names. It suits a small, personal anniversary or a vow renewal more than a large formal party. The sample marks ten years with a four-step story; set your own number of years in the editor.",
  },
  "anniversary/then-and-now": {
    about:
      "Then and Now is built on two photos, one from the wedding and one from today. Apart from that pair it is minimal, with no effects, so the pictures carry it. The sample counts fifteen years in a five-step story; set your own number of years in the editor.",
  },
  "anniversary/vinyl-love-song": {
    about:
      "Vinyl Love Song treats your years together as a record: the schedule reads as a tracklist and the story as liner notes. It suits music lovers and works well with your own song playing as the guest opens the invitation. The sample has three events; set the years in the editor.",
  },
  "corporate/product-launch": {
    occasion: "Product Launch",
    about:
      "Product Launch puts the countdown directly after the headline, so the date is the first thing guests see. The sample has a four-item agenda and a sneak-peek gallery. It leaves out the guest wishes section, which keeps the page business-like for press and partners.",
  },
  "corporate/black-tie-gala": {
    occasion: "Gala",
    about:
      "Black Tie Gala is for a charity dinner, an awards night or an annual gala. The programme shows as cards and the gallery is meant for photos of last year's event. It has no guest wishes section; RSVPs arrive on your dashboard with party sizes, ready for table planning.",
  },
  "corporate/conference-grid": {
    occasion: "Conference",
    about:
      "Conference Grid is for a conference, a summit or a meetup with several speakers. The schedule comes first, as a timeline with six sessions in the sample, followed by speakers in square portraits. The RSVP form works as registration and gives you an attendee list to export.",
  },
  "corporate/holiday-party": {
    occasion: "Office Party",
    about:
      "Holiday Party is for an office year-end or Christmas party. It has a greetings wall, where colleagues leave a message for the team. The sample plans three parts to the evening and shows a carousel of last year's photos.",
  },
  "corporate/team-offsite": {
    occasion: "Team Offsite",
    about:
      "Team Offsite is for a retreat or an away day. The itinerary runs as a timeline across two days and the map section is headed Getting there, because the route is the main question. Use the venue notes for transport and what to pack.",
  },
  "corporate/webinar-minimal": {
    occasion: "Webinar",
    about:
      "Webinar Minimal is for an online event, so it has no map and no gallery. One event card with an add-to-calendar button comes straight after the headline, followed by the speakers and a registration form. It is the shortest design in the collection.",
  },
  "other/engagement-sparkle": {
    occasion: "Engagement",
    about:
      "Engagement Sparkle announces an engagement and invites guests to the party. The gallery is a carousel meant for photos of the proposal, and a ring counts down to the day. The sample plans three parts; change the wording and the design also works for a small wedding.",
  },
  "other/khitanan-ceria": {
    occasion: "Khitanan",
    about:
      "Khitanan Ceria is an invitation for a khitanan (sunatan) thanksgiving. The sample text is written in Bahasa Indonesia in the formal style families use, with the parents' names under the boy's and a three-part programme of prayer, a short talk and lunch. Switch the invitation language to English in the editor if you prefer.",
  },
  "other/aqiqah-soft": {
    occasion: "Aqiqah",
    about:
      "Aqiqah Soft is an invitation for a baby's aqiqah, in soft mint with a seal carrying the baby's initial. The sample text is in Bahasa Indonesia and introduces both parents and the baby. It is a single event with one time and place; switch the language to English in the editor if you prefer.",
  },
  "other/housewarming-keys": {
    occasion: "Housewarming",
    about:
      "Housewarming Keys puts the map straight after the event details, because the address is what guests need most when you have just moved. The sample is one open-house event with six photos of the new home. Use the venue notes for parking and the gate code.",
  },
  "other/bridal-shower-blush": {
    occasion: "Bridal Shower",
    about:
      "Bridal Shower Blush puts the bride-to-be at the centre, with her portrait on the cover and in an arch spotlight. It is usually sent by the maid of honour or a sister. The sample plans three parts to the shower; change the wording and it suits a hen party or a kitchen party.",
  },
  "other/retirement-sunset": {
    occasion: "Retirement",
    about:
      "Retirement Sunset is for a retirement or farewell party. The story section becomes career highlights in five steps, so colleagues can look back over the years. The sample has two events and six photos, and guests can leave a farewell message on the wishes wall.",
  },
  "other/eid-open-house": {
    occasion: "Eid",
    about:
      "Eid Open House invites family, friends and neighbours to your home for Eid al-Fitr or Eid al-Adha. It is a single open-house event, so guests see one time window and the address. A crescent and lantern crest opens the page and the RSVP tells you how many to cook for.",
  },
  "other/christmas-dinner": {
    occasion: "Christmas",
    about:
      "Christmas Dinner is for a family Christmas meal or a festive dinner with friends. It is a single event, shown on one card with the time dinner is served. Use the message for who is bringing what; the design also suits a small office Christmas dinner.",
  },
  "other/class-reunion": {
    occasion: "Reunion",
    about:
      "Class Reunion is for a school or university reunion. The seal carries the class year and a ribbon the number of years since. The gallery is a wall of throwback photos, the sample plans four parts to the day and several organisers can be listed as hosts.",
  },
}

/** Occasions that keep their capital in the middle of a sentence. */
const PROPER = /^(Eid|Christmas|Javanese|Islamic|Khitanan|Aqiqah)/

/**
 * What a template is an invitation for: its own occasion when it names one,
 * else its category ("Wedding"). Pass `sentence` for the mid-sentence form.
 */
export function templateOccasion(
  meta: Pick<TemplateMeta, "id" | "category">,
  { sentence = false }: { sentence?: boolean } = {}
): string {
  const occasion =
    TEMPLATE_PAGES[meta.id]?.occasion ?? CATEGORY_LABELS[meta.category]
  return sentence && !PROPER.test(occasion) ? occasion.toLowerCase() : occasion
}

/** Longest meta description a search result shows in full. */
const META_LIMIT = 155

/**
 * Meta description of a template page: the template's name and occasion
 * first (what people search for), then its own design sentence, cut at a
 * word when it runs past what a search result shows.
 */
export function templateMetaDescription(
  meta: Pick<TemplateMeta, "id" | "category" | "name" | "description">
): string {
  const occasion = templateOccasion(meta, { sentence: true })
  // "Eid Open House" already says Eid; do not repeat it.
  const named = meta.name.toLowerCase().includes(occasion.toLowerCase())
  const full = `${meta.name}${named ? "" : ` ${occasion}`} invitation template. ${meta.description}`
  if (full.length <= META_LIMIT) return full
  const cut = full.slice(0, META_LIMIT)
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;.]$/, "")}…`
}
