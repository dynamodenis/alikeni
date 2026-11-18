import { describe, expect, it } from "vitest"
import { sampleInvitationConfig as sample } from "@/templates/_shared/schema/sample"
import { applyLockedEdits, canEditWhenLocked, isEditLocked } from "./edit-lock"

// Saturday 12 Dec 2026, 15:00 in Nairobi (UTC+3), no sub-events.
const published = {
  ...sample,
  datetime: { start: "2026-12-12T15:00:00+03:00", timezone: "Africa/Nairobi" },
  event: { ...sample.event, subEvents: [] },
}
const DURING = new Date("2026-12-12T16:00:00Z")
const DAY_AFTER = new Date("2026-12-13T20:59:00Z") // 23:59 Sunday in Nairobi
const LOCKED = new Date("2026-12-13T21:00:00Z") // 00:00 Monday in Nairobi

describe("isEditLocked", () => {
  it("locks once the day after the event has passed, event time", () => {
    const invitation = { publishedConfig: published }
    expect(isEditLocked(invitation, DURING)).toBe(false)
    expect(isEditLocked(invitation, DAY_AFTER)).toBe(false)
    expect(isEditLocked(invitation, LOCKED)).toBe(true)
  })

  it("never locks an invitation that was not published", () => {
    expect(isEditLocked({ publishedConfig: null }, LOCKED)).toBe(false)
  })

  it("reopens while a support unlock is in the future", () => {
    const until = new Date(LOCKED.getTime() + 3_600_000)
    const invitation = { publishedConfig: published, editUnlockedUntil: until }
    expect(isEditLocked(invitation, LOCKED)).toBe(false)
    expect(isEditLocked(invitation, new Date(until.getTime() + 1))).toBe(true)
    expect(
      isEditLocked(
        { publishedConfig: published, editUnlockedUntil: until.toISOString() },
        LOCKED
      )
    ).toBe(false)
  })
})

describe("what stays editable", () => {
  it("is photos and the closing words only", () => {
    expect(canEditWhenLocked(["gallery"])).toBe(true)
    expect(canEditWhenLocked(["gallery", 2, "alt"])).toBe(true)
    expect(canEditWhenLocked(["texts", "closing"])).toBe(true)
    expect(canEditWhenLocked(["texts", "headline"])).toBe(false)
    expect(canEditWhenLocked(["texts"])).toBe(false)
    expect(canEditWhenLocked(["datetime", "start"])).toBe(false)
    expect(canEditWhenLocked(["features", "gallery"])).toBe(false)
  })

  it("takes only those parts from what the client sends", () => {
    const photo = { assetKey: "k", url: "https://example.com/a.webp" }
    const incoming = {
      ...published,
      datetime: { ...published.datetime, start: "2027-06-01T15:00:00+03:00" },
      hosts: [{ name: "Someone Else", role: "host" }],
      texts: { ...published.texts, headline: "New event", closing: "Thanks!" },
      gallery: [photo],
    }
    const result = applyLockedEdits(published, incoming)
    expect(result.gallery).toEqual([photo])
    expect(result.texts.closing).toBe("Thanks!")
    expect(result.texts.headline).toBe(published.texts.headline)
    expect(result.datetime).toEqual(published.datetime)
    expect(result.hosts).toEqual(published.hosts)
  })
})
