import { describe, expect, it } from "vitest"
import { getMessages } from "@/lib/i18n"
import { describeRateLimit, formatWait } from "./guest-limit"

describe("formatWait", () => {
  it("rounds up to seconds, minutes, then hours and minutes", () => {
    expect(formatWait(0.2, "en")).toBe("1 second")
    expect(formatWait(42, "en")).toBe("42 seconds")
    expect(formatWait(61, "en")).toBe("2 minutes")
    expect(formatWait(3599, "en")).toBe("1 hour")
    expect(formatWait(3 * 3600 + 9 * 60 + 5, "en")).toBe("3 hours 10 minutes")
  })

  it("uses the invitation's language", () => {
    expect(formatWait(42, "id")).toBe("42 detik")
    expect(formatWait(2 * 3600 + 60, "id")).toBe("2 jam 1 menit")
  })
})

describe("describeRateLimit", () => {
  const en = getMessages("en")
  const id = getMessages("id")
  const minute = {
    scope: "you" as const,
    used: 5,
    limit: 5,
    windowSec: 60,
    retryAfterSec: 42,
  }

  it("tells a guest what they used and when they can send again", () => {
    expect(describeRateLimit(minute, "rsvp", en, "en")).toBe(
      "You have sent 5 responses in the last minute. You can send another in 42 seconds."
    )
    expect(
      describeRateLimit(
        {
          ...minute,
          used: 30,
          limit: 30,
          windowSec: 86_400,
          retryAfterSec: 7_800,
        },
        "wish",
        en,
        "en"
      )
    ).toBe(
      "You have sent 30 wishes in the last 24 hours. You can send another in 2 hours 10 minutes."
    )
    expect(describeRateLimit(minute, "wish", id, "id")).toBe(
      "Anda telah mengirim 5 ucapan dalam satu menit terakhir. Anda dapat mengirim lagi dalam 42 detik."
    )
  })

  it("does not blame the guest for a busy network", () => {
    expect(
      describeRateLimit({ ...minute, scope: "network" }, "wish", en, "en")
    ).toBe(
      "Many guests on your network are sending right now. Please try again in 42 seconds."
    )
  })
})
