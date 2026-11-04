// @vitest-environment node
// The Workers `binding` driver and the upload/file route handlers, against an
// in-memory stand-in for the R2 binding.
import { describe, expect, it } from "vitest"
import { parseServerEnv } from "@/env.server"
import type {
  BucketLike,
  BucketObjectBody,
  BucketRange,
} from "@/server/platform/types"
import { createBindingDriver } from "./binding.server"
import { selectStorage } from "./index.server"
import {
  handleSignedUpload,
  parseRange,
  serveStoredFile,
} from "./routes.server"

type Stored = { bytes: Uint8Array; contentType?: string }

class FakeBucket implements BucketLike {
  readonly objects = new Map<string, Stored>()

  head(key: string) {
    const o = this.objects.get(key)
    return Promise.resolve(
      o
        ? {
            size: o.bytes.byteLength,
            httpMetadata: { contentType: o.contentType },
          }
        : null
    )
  }

  get(key: string, options?: { range?: BucketRange }) {
    const o = this.objects.get(key)
    if (!o) return Promise.resolve(null)
    let bytes = o.bytes
    const range = options?.range
    if (range) {
      if ("suffix" in range) bytes = bytes.subarray(bytes.length - range.suffix)
      else {
        const offset = range.offset ?? 0
        bytes = bytes.subarray(
          offset,
          range.length === undefined ? undefined : offset + range.length
        )
      }
    }
    const body = new Response(bytes.slice()).body
    if (!body) throw new Error("no body")
    const result: BucketObjectBody = {
      body,
      size: o.bytes.byteLength,
      httpMetadata: { contentType: o.contentType },
      range,
    }
    return Promise.resolve(result)
  }

  put(
    key: string,
    value: ArrayBuffer | Uint8Array<ArrayBuffer>,
    options?: { httpMetadata?: { contentType?: string } }
  ) {
    this.objects.set(key, {
      bytes: new Uint8Array(value).slice(),
      contentType: options?.httpMetadata?.contentType,
    })
    return Promise.resolve(null)
  }

  delete(key: string) {
    this.objects.delete(key)
    return Promise.resolve()
  }
}

const SECRET = "binding-test-secret-1234567890"
const ORIGIN = "https://festly.example.com"
const KEY = "u/user-1/image/abc.webp"

function driver(publicUrl?: string) {
  const bucket = new FakeBucket()
  return {
    bucket,
    storage: createBindingDriver({
      bucket,
      secret: SECRET,
      origin: `${ORIGIN}/`,
      publicUrl,
    }),
  }
}

async function signedPut(
  storage: ReturnType<typeof driver>["storage"],
  body: Uint8Array<ArrayBuffer>,
  opts: { mime?: string; signedBytes?: number; sendType?: string } = {}
) {
  const mime = opts.mime ?? "image/webp"
  const target = await storage.createUploadTarget({
    key: KEY,
    mime,
    bytes: opts.signedBytes ?? body.byteLength,
  })
  return handleSignedUpload(
    new Request(target.url, {
      method: "PUT",
      headers: { "Content-Type": opts.sendType ?? mime },
      body,
    }),
    storage
  )
}

describe("binding driver", () => {
  it("signs a PUT to our upload route that expires within 10 minutes", async () => {
    const { storage } = driver()
    const target = await storage.createUploadTarget({
      key: KEY,
      mime: "image/webp",
      bytes: 3,
    })
    const url = new URL(target.url)
    expect(url.origin).toBe(ORIGIN)
    expect(url.pathname).toBe("/api/storage/upload")
    expect(target.headers).toEqual({ "Content-Type": "image/webp" })
    const ttl = Date.parse(target.expiresAt) - Date.now()
    expect(ttl).toBeGreaterThan(0)
    expect(ttl).toBeLessThanOrEqual(600_000)
  })

  it("stores a valid signed upload in the bucket with its type", async () => {
    const { bucket, storage } = driver()
    const res = await signedPut(storage, new Uint8Array([1, 2, 3]))
    expect(res.status).toBe(200)
    expect(bucket.objects.get(KEY)?.contentType).toBe("image/webp")
    expect(await storage.head(KEY)).toEqual({ bytes: 3, mime: "image/webp" })
  })

  it("refuses tampered, mistyped and oversized uploads", async () => {
    const { bucket, storage } = driver()
    const target = await storage.createUploadTarget({
      key: KEY,
      mime: "image/webp",
      bytes: 3,
    })
    const tampered = new URL(target.url)
    tampered.searchParams.set("bytes", "300")
    const forged = await handleSignedUpload(
      new Request(tampered, {
        method: "PUT",
        headers: { "Content-Type": "image/webp" },
        body: new Uint8Array([1]),
      }),
      storage
    )
    expect(forged.status).toBe(403)

    const wrongType = await signedPut(storage, new Uint8Array([1]), {
      sendType: "image/png",
    })
    expect(wrongType.status).toBe(400)

    const tooBig = await signedPut(storage, new Uint8Array([1, 2, 3, 4]), {
      signedBytes: 2,
    })
    expect(tooBig.status).toBe(413)

    const notAllowed = await signedPut(storage, new Uint8Array([1]), {
      mime: "text/html",
    })
    expect(notAllowed.status).toBe(413)
    expect(bucket.objects.size).toBe(0)
  })

  it("puts, gets and deletes server-produced objects", async () => {
    const { storage } = driver()
    expect(await storage.get("og/inv-1.png")).toBeNull()
    await storage.put("og/inv-1.png", new Uint8Array([9, 8, 7]), "image/png")
    const object = await storage.get("og/inv-1.png")
    expect(object?.mime).toBe("image/png")
    expect(
      new Uint8Array(await new Response(object?.body).arrayBuffer())
    ).toEqual(new Uint8Array([9, 8, 7]))
    await storage.delete("og/inv-1.png")
    expect(await storage.head("og/inv-1.png")).toBeNull()
  })

  it("links to R2_PUBLIC_URL when set, else our file route", () => {
    expect(
      driver("https://media.example.com/").storage.publicUrl("u/a b/x.png")
    ).toBe("https://media.example.com/u/a%20b/x.png")
    expect(driver().storage.publicUrl("u/x/image/1.webp")).toBe(
      `${ORIGIN}/api/storage/file/u/x/image/1.webp`
    )
  })

  it("serves files with Range support", async () => {
    const { storage } = driver()
    await storage.put(
      KEY,
      new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
      "audio/mpeg"
    )
    const get = (range?: string) =>
      serveStoredFile(
        new Request(`${ORIGIN}/api/storage/file/${KEY}`, {
          headers: range ? { Range: range } : {},
        }),
        KEY,
        storage
      )

    const full = await get()
    expect(full.status).toBe(200)
    expect(full.headers.get("content-length")).toBe("8")
    expect(full.headers.get("accept-ranges")).toBe("bytes")
    expect(full.headers.get("content-type")).toBe("audio/mpeg")

    const part = await get("bytes=2-4")
    expect(part.status).toBe(206)
    expect(part.headers.get("content-range")).toBe("bytes 2-4/8")
    expect(new Uint8Array(await part.arrayBuffer())).toEqual(
      new Uint8Array([2, 3, 4])
    )

    const tail = await get("bytes=-3")
    expect(tail.headers.get("content-range")).toBe("bytes 5-7/8")
    expect(new Uint8Array(await tail.arrayBuffer())).toEqual(
      new Uint8Array([5, 6, 7])
    )

    expect((await get("bytes=20-")).status).toBe(416)
    expect(
      (
        await serveStoredFile(
          new Request(`${ORIGIN}/api/storage/file/missing`),
          "u/x/image/missing.webp",
          storage
        )
      ).status
    ).toBe(404)
    expect(
      (await serveStoredFile(new Request(ORIGIN), "../etc/passwd", storage))
        .status
    ).toBe(404)
  })
})

describe("parseRange", () => {
  it("handles open, closed, suffix and bad ranges", () => {
    expect(parseRange(null, 10)).toBeNull()
    expect(parseRange("bytes=0-", 10)).toEqual({ start: 0, end: 9 })
    expect(parseRange("bytes=2-100", 10)).toEqual({ start: 2, end: 9 })
    expect(parseRange("bytes=-4", 10)).toEqual({ start: 6, end: 9 })
    expect(parseRange("bytes=5-2", 10)).toBe("unsatisfiable")
    expect(parseRange("bytes=10-", 10)).toBe("unsatisfiable")
    expect(parseRange("bytes=-", 10)).toBeNull()
    expect(parseRange("bytes=0-1,3-4", 10)).toBeNull()
  })
})

describe("binding storage configuration", () => {
  const production = {
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "x".repeat(32),
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Festly <hello@example.com>",
  }

  it("selects the binding when asked, or when bound and R2 keys are absent", () => {
    const bucket = new FakeBucket()
    expect(
      selectStorage(parseServerEnv({ STORAGE_DRIVER: "binding" }), bucket).id
    ).toBe("binding")
    expect(selectStorage(parseServerEnv({}), bucket).id).toBe("binding")
  })

  it("fails clearly without the binding", () => {
    expect(() =>
      selectStorage(parseServerEnv({ STORAGE_DRIVER: "binding" }), undefined)
    ).toThrow(/BUCKET R2 binding/)
  })

  it("is allowed in production with a signing secret, and needs one", () => {
    const env = parseServerEnv({
      ...production,
      STORAGE_DRIVER: "binding",
      STORAGE_SIGNING_SECRET: "s".repeat(32),
      // Only the public URL matters with the binding; no S3 keys needed.
      R2_PUBLIC_URL: "https://media.example.com",
    })
    expect(selectStorage(env, new FakeBucket()).id).toBe("binding")
    expect(() =>
      parseServerEnv({ ...production, STORAGE_DRIVER: "binding" })
    ).toThrow(/STORAGE_SIGNING_SECRET: required in production/)
  })
})
