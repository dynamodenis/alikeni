// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { sampleInvitationConfig } from "@/templates/_shared/schema"
import { clampText, titleSize } from "./card.server"
import { facesFor } from "./fonts.server"
import {
  cardProps,
  fetchPhoto,
  loadPhoto,
  pickPhotoUrl,
  renderOgCard,
  toHex,
  type OgConfig,
} from "./render.server"

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

/** Width and height from the IHDR chunk (always first, at byte 16). */
function pngSize(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength)
  return { width: view.getUint32(16), height: view.getUint32(20) }
}

const noPhoto: OgConfig = { ...sampleInvitationConfig, gallery: [] }

const pngResponse = (bytes: Uint8Array<ArrayBuffer>) =>
  new Response(bytes, { headers: { "content-type": "image/png" } })

describe("renderOgCard", () => {
  let card: Uint8Array<ArrayBuffer> = new Uint8Array()

  it("renders a 1200×630 PNG", async () => {
    const started = performance.now()
    card = await renderOgCard(noPhoto)
    const elapsed = performance.now() - started
    expect([...card.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
    expect(pngSize(card)).toEqual({ width: 1200, height: 630 })
    // Cold start (WASM + fonts) included; generous for slow CI.
    expect(elapsed).toBeLessThan(10_000)
  }, 20_000)

  it("embeds the first photo, fetched through the given fetch", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => pngResponse(card))
    const withPhoto = await renderOgCard(sampleInvitationConfig, { fetchImpl })
    expect(fetchImpl).toHaveBeenCalledWith(
      sampleInvitationConfig.gallery[0].url,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    )
    expect(pngSize(withPhoto)).toEqual({ width: 1200, height: 630 })
    expect(withPhoto).not.toEqual(card)
  }, 20_000)

  it("still renders when the photo fails, with any font pair", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => {
      throw new Error("offline")
    })
    const png = await renderOgCard(
      {
        ...sampleInvitationConfig,
        theme: { ...sampleInvitationConfig.theme, fontPairId: "no-such-pair" },
        texts: { ...sampleInvitationConfig.texts, headline: "x".repeat(160) },
      },
      { fetchImpl }
    )
    expect(pngSize(png)).toEqual({ width: 1200, height: 630 })
  }, 20_000)
})

describe("fetchPhoto", () => {
  it("returns a data URL for PNG and JPEG", async () => {
    const url = await fetchPhoto("https://cdn.test/a.png", async () =>
      pngResponse(new Uint8Array([1, 2, 3]))
    )
    expect(url).toBe("data:image/png;base64,AQID")
  })

  it("skips unsupported types, errors, non-http URLs and slow hosts", async () => {
    const webp = async () =>
      new Response("x", { headers: { "content-type": "image/webp" } })
    expect(await fetchPhoto("https://cdn.test/a.webp", webp)).toBeUndefined()
    const missing = async () => new Response("no", { status: 404 })
    expect(await fetchPhoto("https://cdn.test/a.png", missing)).toBeUndefined()
    const never = vi.fn<typeof fetch>()
    expect(await fetchPhoto("file:///etc/passwd", never)).toBeUndefined()
    expect(never).not.toHaveBeenCalled()

    const hang: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(init.signal?.reason)
        )
      })
    expect(
      await fetchPhoto("https://cdn.test/slow.png", hang, 20)
    ).toBeUndefined()
  })
})

describe("loadPhoto", () => {
  const photo = { assetKey: "useruploads/u/a.webp", url: "https://cdn.test/a" }
  const never = vi.fn<typeof fetch>(async () => {
    throw new Error("should not fetch")
  })

  it("reads from storage and converts WebP to JPEG", async () => {
    const toJpeg = vi.fn(async () => new Uint8Array([1, 2, 3]))
    const url = await loadPhoto(photo, {
      readObject: async (key) =>
        key === photo.assetKey
          ? { body: new Uint8Array([9, 9]), mime: "image/webp" }
          : null,
      toJpeg,
      fetchImpl: never,
    })
    expect(url).toBe("data:image/jpeg;base64,AQID")
    expect(toJpeg).toHaveBeenCalledWith(new Uint8Array([9, 9]))
    expect(never).not.toHaveBeenCalled()
  })

  it("falls back to the URL when storage misses or throws", async () => {
    const fetchImpl = async () => pngResponse(new Uint8Array([1, 2, 3]))
    expect(
      await loadPhoto(photo, { readObject: async () => null, fetchImpl })
    ).toBe("data:image/png;base64,AQID")
    const broken = async () => {
      throw new Error("storage down")
    }
    expect(await loadPhoto(photo, { readObject: broken, fetchImpl })).toBe(
      "data:image/png;base64,AQID"
    )
  })

  it("leaves WebP off when there is no converter or it fails", async () => {
    const webp = async () =>
      new Response("x", { headers: { "content-type": "image/webp" } })
    expect(await loadPhoto(photo, { fetchImpl: webp })).toBeUndefined()
    expect(
      await loadPhoto(photo, {
        fetchImpl: webp,
        toJpeg: async () => undefined,
      })
    ).toBeUndefined()
  })
})

describe("card content", () => {
  it("uses the palette, headline, long date in the event zone, and place", () => {
    const props = cardProps({
      ...noPhoto,
      datetime: {
        start: "2027-06-12T22:30:00+00:00",
        timezone: "Africa/Nairobi",
      },
    })
    expect(props).toMatchObject({
      colors: {
        background: "#f8f3ea",
        foreground: "#2a1e14",
        primary: "#a8783a",
      },
      title: "Amara & Kofi",
      eyebrow: "The Wedding of Amara & Kofi",
      date: "Sunday, June 13, 2027",
      place: "The Old Mill Gardens",
    })
  })

  it("converts custom oklch colors to hex for satori", () => {
    expect(toHex("oklch(1 0 0)")).toBe("#ffffff")
    expect(toHex("#abc")).toBe("#aabbcc")
    expect(toHex("nope")).toBeNull()
    const props = cardProps({
      ...noPhoto,
      theme: {
        ...noPhoto.theme,
        custom: {
          primary: "oklch(0 0 0)",
          secondary: "#eeeeee",
          accent: "#888888",
          background: "oklch(1 0 0)",
          foreground: "#111",
        },
      },
    })
    expect(props.colors).toEqual({
      background: "#ffffff",
      foreground: "#111111",
      primary: "#000000",
    })
  })

  it("prefers a gallery photo, then a host photo", () => {
    expect(pickPhotoUrl(sampleInvitationConfig)).toBe(
      sampleInvitationConfig.gallery[0].url
    )
    const hostPhoto = { assetKey: "h.png", url: "https://cdn.test/h.png" }
    expect(
      pickPhotoUrl({
        ...noPhoto,
        hosts: [noPhoto.hosts[0], { ...noPhoto.hosts[1], photo: hostPhoto }],
      })
    ).toBe(hostPhoto.url)
    expect(pickPhotoUrl(noPhoto)).toBeUndefined()
  })

  it("clamps long text and shrinks long titles", () => {
    expect(clampText("a  b", 10)).toBe("a b")
    expect(clampText("x".repeat(100), 10)).toBe(`${"x".repeat(9)}…`)
    expect(titleSize("Amara & Kofi", false)).toBeGreaterThan(
      titleSize("x".repeat(80), false)
    )
    expect(titleSize("x".repeat(80), true)).toBeLessThan(
      titleSize("x".repeat(80), false)
    )
  })

  it("maps every font pair, falling back to the default", () => {
    expect(facesFor("cinzel-garamond")).toEqual({
      display: "cinzel",
      body: "eb-garamond",
    })
    expect(facesFor("unknown")).toEqual(facesFor("playfair-inter"))
  })
})
