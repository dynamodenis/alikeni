import { describe, expect, it } from "vitest"
import { sampleInvitationConfig as sample } from "@/templates/_shared/schema/sample"
import {
  albumMimeForName,
  checkAlbumFile,
  checkAlbumThumb,
  guestUploadDays,
  guestUploadState,
  sniffAgrees,
  sniffMedia,
} from "./album"

const bytes = (...values: Array<number | string>) =>
  new Uint8Array(
    values.flatMap((v) =>
      typeof v === "string" ? [...v].map((c) => c.charCodeAt(0)) : [v]
    )
  )

describe("album file rules", () => {
  it("accepts photos and videos within their size limits", () => {
    expect(checkAlbumFile("image/jpeg", 5_000_000)).toEqual({
      ok: true,
      kind: "image",
    })
    expect(checkAlbumFile("video/mp4", 90 * 1024 * 1024)).toEqual({
      ok: true,
      kind: "video",
    })
    expect(checkAlbumFile("image/jpeg", 26 * 1024 * 1024).ok).toBe(false)
    expect(checkAlbumFile("video/mp4", 96 * 1024 * 1024).ok).toBe(false)
    expect(checkAlbumFile("application/pdf", 10).ok).toBe(false)
    expect(checkAlbumFile("image/heic", 10).ok).toBe(false)
    expect(checkAlbumFile("image/png", 0).ok).toBe(false)
  })

  it("accepts only small WebP or JPEG previews", () => {
    expect(checkAlbumThumb("image/webp", 40_000)).toBe(true)
    expect(checkAlbumThumb("image/png", 40_000)).toBe(false)
    expect(checkAlbumThumb("image/webp", 2_000_000)).toBe(false)
  })

  it("maps file names from a zip to a type", () => {
    expect(albumMimeForName("party/IMG_0042.JPG")).toBe("image/jpeg")
    expect(albumMimeForName("clip.MOV")).toBe("video/quicktime")
    expect(albumMimeForName("notes.txt")).toBeUndefined()
    expect(albumMimeForName("README")).toBeUndefined()
  })
})

describe("sniffMedia", () => {
  it("reads the type from the first bytes", () => {
    expect(sniffMedia(bytes(0xff, 0xd8, 0xff, 0xe0, "....JFIF"))).toBe(
      "image/jpeg"
    )
    expect(sniffMedia(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a, "...."))).toBe(
      "image/png"
    )
    expect(sniffMedia(bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("image/webp")
    expect(sniffMedia(bytes(0, 0, 0, 28, "ftypavif"))).toBe("image/avif")
    expect(sniffMedia(bytes(0, 0, 0, 24, "ftypisom"))).toBe("video/mp4")
    expect(sniffMedia(bytes(0, 0, 0, 20, "ftypqt  "))).toBe("video/quicktime")
    expect(sniffMedia(bytes(0x1a, 0x45, 0xdf, 0xa3, "........"))).toBe(
      "video/webm"
    )
  })

  it("refuses HEIC, scripts, archives and short files", () => {
    expect(sniffMedia(bytes(0, 0, 0, 24, "ftypheic"))).toBeUndefined()
    expect(sniffMedia(bytes("#!/bin/sh\necho"))).toBeUndefined()
    expect(sniffMedia(bytes("PK", 3, 4, "........"))).toBeUndefined()
    expect(sniffMedia(bytes(0xff, 0xd8))).toBeUndefined()
  })

  it("treats MP4 and MOV as the same container", () => {
    expect(sniffAgrees("video/quicktime", "video/mp4")).toBe(true)
    expect(sniffAgrees("image/jpeg", "image/png")).toBe(false)
    expect(sniffAgrees("image/jpeg", undefined)).toBe(false)
  })
})

describe("guest upload window", () => {
  const config = {
    datetime: {
      start: "2027-06-12T15:00:00+03:00",
      end: "2027-06-12T23:00:00+03:00",
      timezone: "Africa/Nairobi",
    },
    event: {
      ...sample.event,
      subEvents: [
        { label: "Welcome dinner", start: "2027-06-11T19:00:00+03:00" },
        { label: "Brunch", start: "2027-06-13T10:00:00+03:00" },
      ],
    },
  }

  it("runs from the first event day to seven days after the last", () => {
    expect(guestUploadDays(config)).toEqual({
      from: "2027-06-11",
      until: "2027-06-20",
    })
  })

  it("is decided in the event's time zone", () => {
    // 22:30 UTC on the 10th is already the 11th in Nairobi.
    expect(guestUploadState(config, new Date("2027-06-10T20:59:00Z"))).toBe(
      "before"
    )
    expect(guestUploadState(config, new Date("2027-06-10T21:01:00Z"))).toBe(
      "open"
    )
    expect(guestUploadState(config, new Date("2027-06-20T20:59:00Z"))).toBe(
      "open"
    )
    expect(guestUploadState(config, new Date("2027-06-20T21:01:00Z"))).toBe(
      "closed"
    )
  })
})
