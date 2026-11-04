import { describe, expect, it } from "vitest"
import {
  dateParts,
  formatLongDate,
  formatTime,
  formatTimeRange,
  zoneLabel,
} from "./format-date"

const START = "2027-06-12T15:00:00+03:00"
const END = "2027-06-12T22:30:00+03:00"

describe("format-date", () => {
  it("formats English dates in the invitation time zone", () => {
    expect(formatLongDate(START, "Africa/Nairobi")).toBe(
      "Saturday, June 12, 2027"
    )
    expect(formatTime(START, "Africa/Nairobi")).toBe("3:00 PM")
    expect(formatTimeRange(START, END, "Africa/Nairobi")).toBe(
      "3:00 PM – 10:30 PM"
    )
  })

  it("formats Indonesian dates with id-ID conventions", () => {
    expect(formatLongDate(START, "Africa/Nairobi", "id")).toBe(
      "Sabtu, 12 Juni 2027"
    )
    expect(formatTime(START, "Africa/Nairobi", "id")).toBe("15.00")
    expect(zoneLabel(START, "Asia/Jakarta", "id")).toBe("WIB")
  })

  it("uses the invitation zone, not the runtime's, across midnight", () => {
    // 23:30 in Nairobi is already the next day in Jakarta.
    const late = "2027-06-12T23:30:00+03:00"
    expect(formatLongDate(late, "Africa/Nairobi")).toContain("June 12")
    expect(formatLongDate(late, "Asia/Jakarta", "id")).toBe(
      "Minggu, 13 Juni 2027"
    )
  })

  it("splits parts for covers and stamps", () => {
    expect(dateParts(START, "Africa/Nairobi")).toEqual({
      weekday: "Saturday",
      day: "12",
      month: "June",
      year: "2027",
      time: "3:00 PM",
    })
    expect(dateParts(START, "Africa/Nairobi", "id")).toMatchObject({
      weekday: "Sabtu",
      month: "Juni",
      time: "15.00",
    })
  })

  it("keeps an end-less range to the start time", () => {
    expect(formatTimeRange(START, undefined, "Africa/Nairobi", "id")).toBe(
      "15.00"
    )
  })
})
