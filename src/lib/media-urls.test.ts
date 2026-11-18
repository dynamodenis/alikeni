import { describe, expect, it } from "vitest"
import { sampleInvitationConfig as sample } from "@/templates/_shared/schema/sample"
import { withMediaUrls } from "./media-urls"

const media = (key: string) => `https://media.alikeni.com/${key}`
const old = (key: string) => `https://alikeni.com/api/storage/file/${key}`
const KEY = "useruploads/owner-1/photo.webp"

describe("withMediaUrls", () => {
  it("rebuilds every stored file's address from its key", () => {
    const config = {
      ...sample,
      hosts: [
        {
          ...sample.hosts[0],
          photo: { assetKey: KEY, url: old(KEY), alt: "A" },
        },
      ],
      gallery: [{ assetKey: KEY, url: old(KEY), width: 800 }],
      story: [
        { title: "Met", body: "…", photo: { assetKey: KEY, url: old(KEY) } },
      ],
      music: {
        enabled: true,
        loop: true,
        source: {
          kind: "upload" as const,
          assetKey: "useruploads/owner-1/song.mp3",
          url: old("useruploads/owner-1/song.mp3"),
          rightsConfirmedAt: "2026-01-01T00:00:00+00:00",
        },
      },
    }
    const out = withMediaUrls(config, media)
    expect(out.hosts[0].photo).toEqual({
      assetKey: KEY,
      url: media(KEY),
      alt: "A",
    })
    expect(out.gallery[0]).toEqual({
      assetKey: KEY,
      url: media(KEY),
      width: 800,
    })
    expect(out.story[0].photo.url).toBe(media(KEY))
    expect(out.music.source.url).toBe(media("useruploads/owner-1/song.mp3"))
    // The input is untouched.
    expect(config.gallery[0].url).toBe(old(KEY))
  })

  it("leaves sample content and outside links alone", () => {
    const picsum = {
      assetKey: "samples/ivory1.jpg",
      url: "https://picsum.photos/seed/ivory1/1200/900",
    }
    const config = {
      gallery: [picsum],
      gifts: {
        registryLinks: [{ label: "Registry", url: "https://example.com" }],
      },
    }
    expect(withMediaUrls(config, media)).toBe(config)
  })

  it("returns the same object when every address is already current", () => {
    const config = { gallery: [{ assetKey: KEY, url: media(KEY) }] }
    expect(withMediaUrls(config, media)).toBe(config)
  })

  it("walks lists of rows and passes other values through", () => {
    const rows = [
      { id: "a", config: { gallery: [{ assetKey: KEY, url: old(KEY) }] } },
      { id: "b", config: null, count: 3 },
    ]
    const out = withMediaUrls(rows, media)
    expect(out[0].config?.gallery[0].url).toBe(media(KEY))
    expect(out[1]).toBe(rows[1])
    expect(withMediaUrls(null, media)).toBeNull()
    expect(withMediaUrls("text", media)).toBe("text")
  })
})
