import { describe, expect, it } from "vitest"
import {
  buildIcs,
  escapeIcsText,
  foldIcsLine,
  googleCalendarUrl,
  icsPath,
  toUtcStamp,
} from "./calendar"

describe("calendar links", () => {
  it("converts offsets to UTC stamps", () => {
    expect(toUtcStamp("2027-06-12T15:00:00+03:00")).toBe("20270612T120000Z")
  })

  it("builds a Google Calendar template link", () => {
    const url = new URL(
      googleCalendarUrl({
        title: "Amara & Kofi",
        start: "2027-06-12T15:00:00+03:00",
        end: "2027-06-12T23:00:00+03:00",
        timezone: "Africa/Nairobi",
        location: "Limuru Road, Nairobi",
      })
    )
    expect(url.hostname).toBe("calendar.google.com")
    expect(url.searchParams.get("dates")).toBe(
      "20270612T120000Z/20270612T200000Z"
    )
    expect(url.searchParams.get("ctz")).toBe("Africa/Nairobi")
    expect(url.searchParams.get("location")).toBe("Limuru Road, Nairobi")
  })

  it("defaults the end to two hours after start", () => {
    const url = new URL(
      googleCalendarUrl({
        title: "x",
        start: "2027-06-12T15:00:00+03:00",
        timezone: "UTC",
      })
    )
    expect(url.searchParams.get("dates")).toBe(
      "20270612T120000Z/20270612T140000Z"
    )
  })

  it("encodes the ics slug", () => {
    expect(icsPath("amara-and-kofi")).toBe("/ics/amara-and-kofi")
  })
})

describe("ics", () => {
  const bytes = (s: string) => new TextEncoder().encode(s).length

  it("escapes TEXT values", () => {
    expect(escapeIcsText("a\\b; c, d\ne\r\nf")).toBe("a\\\\b\\; c\\, d\\ne\\nf")
  })

  it("leaves short lines alone", () => {
    expect(foldIcsLine("SUMMARY:Hi")).toBe("SUMMARY:Hi")
  })

  it("folds at 75 octets with a leading space on continuations", () => {
    const line = "DESCRIPTION:" + "x".repeat(200)
    const folded = foldIcsLine(line)
    const physical = folded.split("\r\n")
    expect(physical.length).toBeGreaterThan(2)
    for (const part of physical) expect(bytes(part)).toBeLessThanOrEqual(75)
    expect(physical.slice(1).every((p) => p.startsWith(" "))).toBe(true)
    expect(folded.replace(/\r\n /g, "")).toBe(line)
  })

  it("never splits a multi-byte character", () => {
    const line = "SUMMARY:" + "é🎉".repeat(40)
    const folded = foldIcsLine(line)
    for (const part of folded.split("\r\n")) {
      expect(bytes(part)).toBeLessThanOrEqual(75)
    }
    expect(folded.replace(/\r\n /g, "")).toBe(line)
  })

  it("builds a calendar with UTC times, escaping and CRLF", () => {
    const ics = buildIcs(
      [
        {
          uid: "amara-1@festly",
          title: "Akad, Nikah",
          start: "2027-06-12T09:00:00+03:00",
          location: "Hall; Main",
          description: "Line 1\nLine 2",
          url: "https://festly.app/i/amara",
        },
      ],
      { now: new Date("2027-01-01T00:00:00Z"), name: "Amara & Kofi" }
    )
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true)
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true)
    expect(ics).not.toMatch(/[^\r]\n/)
    expect(ics).toContain("UID:amara-1@festly")
    expect(ics).toContain("DTSTAMP:20270101T000000Z")
    expect(ics).toContain("DTSTART:20270612T060000Z")
    expect(ics).toContain("DTEND:20270612T080000Z")
    expect(ics).toContain("SUMMARY:Akad\\, Nikah")
    expect(ics).toContain("LOCATION:Hall\\; Main")
    expect(ics).toContain("DESCRIPTION:Line 1\\nLine 2")
    expect(ics).toContain("URL:https://festly.app/i/amara")
  })
})
