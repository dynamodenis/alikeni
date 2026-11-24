import { describe, expect, it } from "vitest"
import { SECTION_LABELS } from "@/components/editor/tabs/SectionsTab"
import { SectionId } from "@/templates/_shared/schema"
import { HELP_SECTIONS, HELP_TABS } from "./help-content"

describe("help content", () => {
  it("names every section as the Sections tab does", () => {
    for (const id of SectionId.options) {
      expect(HELP_SECTIONS[id].name, id).toBe(SECTION_LABELS[id])
    }
  })

  it("only points at tabs it also explains", () => {
    const tabs = HELP_TABS.map((tab) => tab.name)
    for (const id of SectionId.options) {
      const { tab } = HELP_SECTIONS[id]
      if (tab.startsWith("Nothing")) continue
      expect(
        tabs.some((name) => tab.includes(name)),
        `${id}: ${tab}`
      ).toBe(true)
    }
  })
})
