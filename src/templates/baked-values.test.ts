// @vitest-environment node
// Guards AGENTS.md rule 1: a template design never contains a value that
// belongs to one event. Dates, years, ages and counts come from `config`;
// sample content lives in defaults.ts. This scans every template's .tsx for
// digits and number words in visible text. It cannot recognise names of
// people or places: review those by reading.
import { describe, expect, it } from "vitest"

const SOURCES = import.meta.glob<string>("./*/*/*.tsx", {
  query: "?raw",
  import: "default",
  eager: true,
})

/** Template designs only: the shared kit holds no sample content. */
const FILES = Object.keys(SOURCES)
  .filter((file) => !file.startsWith("./_shared/"))
  .sort()

/** Props that never reach the page as text. */
const NOT_TEXT =
  /^(className|\w+ClassName|id|key|d|viewBox|points|fill|stroke\w*|transform|href|src|type|role|variant|portrait|outline|tone|size|width|height|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|dx|dy|offset|dur|values|begin|fontSize|fontWeight|letterSpacing|textAnchor|dominantBaseline|pathLength|clear|kind|effect|titleEffect|align|loading|decoding|rel|target|preserveAspectRatio|xmlns|opacity|\w+Opacity|seed|tag)$/

const MONTH_OR_WEEKDAY =
  /\b(January|February|March|April|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/
const NUMBER_WORD =
  /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(-\w+)?\s+(years?|decades?|days?|months?|weeks?|nights?)\b/i

/**
 * Fixed wording that is part of a design and true for any event. Keep this
 * short: a date, year, age or count is never allowed here.
 */
const ALLOWED = new Set([
  "1UP", // Retro Arcade scoreboard
  "Player 1 ready", // Retro Arcade kicker
  "exit 0", // Tech Terminal prompt
  "Row A · Seat 1", // Cinema Reel ticket stub
  "Last December", // Holiday Party: last year's party photos
])

function findings(source: string): Array<string> {
  const found: Array<string> = []
  // Comments describe the design and may mention the sample.
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
  for (const [, prop, value] of code.matchAll(/\b([A-Za-z]\w*)="([^"]*)"/g)) {
    if (NOT_TEXT.test(prop) || ALLOWED.has(value)) continue
    if (
      /\d/.test(value) ||
      MONTH_OR_WEEKDAY.test(value) ||
      NUMBER_WORD.test(value)
    )
      found.push(`${prop}="${value}"`)
  }
  for (const [, text] of code.matchAll(/>([^<>{}=;()]*\d[^<>{}=;()]*)</g)) {
    const value = text.trim()
    if (value && !ALLOWED.has(value)) found.push(`text "${value}"`)
  }
  return found
}

describe("template designs hold no event-specific values", () => {
  it("finds the template sources", () => {
    expect(FILES.length).toBeGreaterThan(50)
  })

  it.each(FILES)("%s", (file) => {
    expect(
      findings(SOURCES[file]),
      "Take dates, years, ages and counts from config (see AGENTS.md rule 1)"
    ).toEqual([])
  })

  it("catches the cases it exists for", () => {
    expect(findings(`<Seal label="'27" caption="Est." />`)).toHaveLength(1)
    expect(findings(`<EventDetails eyebrow="13 May" />`)).toHaveLength(1)
    expect(findings(`<Hero kicker="Conference · 2027" />`)).toHaveLength(1)
    expect(findings(`<Story eyebrow="Six decades" />`)).toHaveLength(1)
    expect(findings(`<Seal label="25" caption="December" />`)).toHaveLength(2)
    expect(findings(`<p>Class of 2007</p>`)).toHaveLength(1)
    expect(
      findings(`<Hero kicker={\`Conference · \${date.year}\`} />`)
    ).toEqual([])
    expect(findings(`<Seal label={year} caption="Class of" />`)).toEqual([])
    expect(findings(`<div className="mt-6 w-1/2" />`)).toEqual([])
  })
})
