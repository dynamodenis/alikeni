import { describe, expect, it } from "vitest"
import { sampleInvitationConfig as sample } from "./_shared/schema/sample"
import { TEMPLATE_METAS } from "./registry"
import { TEMPLATE_PAGES, templateOccasion } from "./template-pages"
import { loadTemplateSections, sectionLabels } from "./template-sections"

describe("template pages", () => {
  it("has copy for every template and for nothing else", () => {
    expect(Object.keys(TEMPLATE_PAGES).sort()).toEqual(
      TEMPLATE_METAS.map((meta) => meta.id).sort()
    )
  })

  it("gives every template its own substantial paragraph", () => {
    const abouts = Object.values(TEMPLATE_PAGES).map(
      (page) => page?.about ?? ""
    )
    expect(new Set(abouts).size).toBe(abouts.length)
    for (const about of abouts) {
      expect(about.split(/\s+/).length, about).toBeGreaterThanOrEqual(35)
    }
  })

  it("names a real occasion for every template in the Other category", () => {
    for (const meta of TEMPLATE_METAS.filter((m) => m.category === "other")) {
      expect(templateOccasion(meta), meta.id).not.toBe("Other")
    }
  })

  it("lowercases occasions mid-sentence, except proper nouns", () => {
    expect(
      templateOccasion(
        { id: "wedding/ivory-garden", category: "wedding" },
        { sentence: true }
      )
    ).toBe("wedding")
    expect(
      templateOccasion(
        { id: "other/eid-open-house", category: "other" },
        { sentence: true }
      )
    ).toBe("Eid")
  })
})

describe("template sections", () => {
  it("lists the sample's sections in order, skipping switched-off ones", () => {
    const labels = sectionLabels({
      ...sample,
      sectionsOrder: ["hero", "event", "map", "wishes", "rsvp"],
      features: { ...sample.features, wishes: false },
    })
    expect(labels.slice(0, 5)).toEqual([
      "Opening cover",
      "Headline",
      "Event details and schedule",
      "Map and directions",
      "RSVP form",
    ])
  })

  it("loads a section list for every template", async () => {
    for (const meta of TEMPLATE_METAS) {
      const sections = await loadTemplateSections(meta.id)
      expect(sections.length, meta.id).toBeGreaterThan(4)
      expect(new Set(sections).size, meta.id).toBe(sections.length)
    }
    expect(await loadTemplateSections("wedding/nope")).toEqual([])
  }, 30_000)
})
