import { describe, expect, it } from "vitest"
import { sampleInvitationConfig as sampleConfig } from "@/templates/_shared/schema/sample"
import {
  addDays,
  configForPlan,
  defaultCurrency,
  formatPrice,
  freeHasEnded,
  freeOnlineUntil,
  lastEventMoment,
  localDay,
} from "./plans"

const dated = (
  start: string,
  timezone: string,
  subEvents: Array<{ start: string; end?: string }> = []
) => ({
  datetime: { start, timezone },
  event: {
    ...sampleConfig.event,
    subEvents: subEvents.map((sub, i) => ({ label: `Part ${i}`, ...sub })),
  },
})

describe("free-plan expiry", () => {
  it("keeps the page online through the day after the event, local time", () => {
    // Saturday 12 Dec 2026, 15:00 in Nairobi (UTC+3).
    const config = dated("2026-12-12T15:00:00+03:00", "Africa/Nairobi")
    expect(freeOnlineUntil(config)).toBe("2026-12-13")
    // 23:59 Sunday Nairobi time is still online …
    expect(freeHasEnded(config, new Date("2026-12-13T20:59:00Z"))).toBe(false)
    // … 00:00 Monday Nairobi time is not.
    expect(freeHasEnded(config, new Date("2026-12-13T21:00:00Z"))).toBe(true)
  })

  it("counts from the last sub-event, not the first", () => {
    const config = dated("2026-12-12T10:00:00+03:00", "Africa/Nairobi", [
      { start: "2026-12-12T10:00:00+03:00" },
      { start: "2026-12-14T18:00:00+03:00", end: "2026-12-14T23:00:00+03:00" },
    ])
    expect(lastEventMoment(config).toISOString()).toBe(
      "2026-12-14T20:00:00.000Z"
    )
    expect(freeOnlineUntil(config)).toBe("2026-12-15")
  })

  it("uses the event's time zone for the day boundary", () => {
    // 23:30 on the 12th in New York is already the 13th in UTC.
    const config = dated("2026-12-12T23:30:00-05:00", "America/New_York")
    expect(freeOnlineUntil(config)).toBe("2026-12-13")
  })

  it("handles month ends and unknown zones", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(localDay(new Date("2026-06-01T12:00:00Z"), "Not/AZone")).toBe(
      "2026-06-01"
    )
  })
})

describe("configForPlan", () => {
  const withGifts = {
    ...sampleConfig,
    gifts: {
      enabled: true,
      accounts: [{ bank: "KCB", holder: "Amara", number: "1234" }],
      ewallets: [{ provider: "M-Pesa", holder: "Amara", number: "0712" }],
      registryLinks: [{ label: "Registry", url: "https://example.com" }],
    },
    features: { ...sampleConfig.features, gifts: true },
  }

  it("removes every gift detail on free", () => {
    const free = configForPlan(withGifts, "free")
    expect(free.features.gifts).toBe(false)
    expect(free.gifts).toEqual({
      enabled: false,
      accounts: [],
      ewallets: [],
      registryLinks: [],
    })
    expect(JSON.stringify(free)).not.toContain("1234")
  })

  it("keeps them on premium", () => {
    expect(configForPlan(withGifts, "premium")).toBe(withGifts)
  })
})

describe("prices", () => {
  it("picks KES in Kenya and USD elsewhere", () => {
    expect(defaultCurrency("KE")).toBe("KES")
    expect(defaultCurrency("ke")).toBe("KES")
    expect(defaultCurrency("US")).toBe("USD")
    expect(defaultCurrency(null)).toBe("USD")
  })

  it("formats whole amounts without decimals", () => {
    expect(formatPrice("USD")).toBe("$12")
    expect(formatPrice("KES")).toMatch(/^KES\s1,500$/)
  })
})
