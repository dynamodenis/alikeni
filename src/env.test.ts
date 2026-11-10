import { describe, expect, it } from "vitest"
import { parsePublicEnv } from "./env.public"
import { parseServerEnv } from "./env.server"

describe("server env", () => {
  it("applies defaults when nothing is set", () => {
    const env = parseServerEnv({})
    expect(env.NODE_ENV).toBe("development")
    expect(env.APP_ORIGIN).toBe("http://localhost:3000")
    expect(env.GEOCODE_CONTACT_EMAIL).toBeUndefined()
    expect(env.DATABASE_URL).toBeUndefined()
  })

  it("accepts only postgres database URLs", () => {
    expect(
      parseServerEnv({
        DATABASE_URL:
          "postgresql://user:pw@ep-x-pooler.eu-central-1.aws.neon.tech/alikeni?sslmode=require",
      }).DATABASE_URL
    ).toContain("neon.tech")
    expect(() =>
      parseServerEnv({ DATABASE_URL: "mysql://localhost/alikeni" })
    ).toThrow(/DATABASE_URL/)
  })

  it("rejects a malformed origin or email", () => {
    expect(() => parseServerEnv({ APP_ORIGIN: "not a url" })).toThrow(
      /APP_ORIGIN/
    )
    expect(() => parseServerEnv({ GEOCODE_CONTACT_EMAIL: "nope" })).toThrow(
      /GEOCODE_CONTACT_EMAIL/
    )
  })
})

describe("auth env", () => {
  const production = {
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "x".repeat(32),
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Alikeni <hello@example.com>",
  }

  it("requires the auth secret and email settings in production", () => {
    expect(() => parseServerEnv(production)).not.toThrow()
    for (const key of [
      "BETTER_AUTH_SECRET",
      "RESEND_API_KEY",
      "EMAIL_FROM",
    ] as const) {
      expect(() => parseServerEnv({ ...production, [key]: "" })).toThrow(
        new RegExp(`${key}: required in production`)
      )
    }
  })

  it("lets development run without them", () => {
    expect(() => parseServerEnv({ NODE_ENV: "development" })).not.toThrow()
  })

  it("rejects a short auth secret", () => {
    expect(() =>
      parseServerEnv({ ...production, BETTER_AUTH_SECRET: "short" })
    ).toThrow(/BETTER_AUTH_SECRET/)
  })

  it("wants both Google keys or neither", () => {
    expect(() => parseServerEnv({ GOOGLE_CLIENT_ID: "id" })).toThrow(
      /GOOGLE_CLIENT_SECRET/
    )
    expect(() => parseServerEnv({ GOOGLE_CLIENT_SECRET: "s" })).toThrow(
      /GOOGLE_CLIENT_ID/
    )
    expect(() =>
      parseServerEnv({ GOOGLE_CLIENT_ID: "id", GOOGLE_CLIENT_SECRET: "s" })
    ).not.toThrow()
  })
})

describe("storage env", () => {
  const production = {
    NODE_ENV: "production",
    BETTER_AUTH_SECRET: "x".repeat(32),
    RESEND_API_KEY: "re_test",
    EMAIL_FROM: "Alikeni <hello@example.com>",
  }

  it("accepts the Workers binding driver with only R2_PUBLIC_URL", () => {
    const env = parseServerEnv({
      STORAGE_DRIVER: "binding",
      R2_PUBLIC_URL: "https://media.example.com",
    })
    expect(env.STORAGE_DRIVER).toBe("binding")
  })

  it("needs STORAGE_SIGNING_SECRET for the binding in production", () => {
    expect(() =>
      parseServerEnv({ ...production, STORAGE_DRIVER: "binding" })
    ).toThrow(/STORAGE_SIGNING_SECRET: required in production/)
    expect(() =>
      parseServerEnv({
        ...production,
        STORAGE_DRIVER: "binding",
        STORAGE_SIGNING_SECRET: "s".repeat(32),
      })
    ).not.toThrow()
  })

  it("keeps local storage out of production", () => {
    expect(() =>
      parseServerEnv({ ...production, STORAGE_DRIVER: "local" })
    ).toThrow(/development only/)
  })

  it("rejects unknown drivers", () => {
    expect(() => parseServerEnv({ STORAGE_DRIVER: "s3" })).toThrow(
      /STORAGE_DRIVER/
    )
  })
})

describe("public env", () => {
  it("parses boolean-ish flags", () => {
    expect(parsePublicEnv({}).VITE_ENABLE_DEV_ROUTES).toBe(false)
    expect(
      parsePublicEnv({ VITE_ENABLE_DEV_ROUTES: "1" }).VITE_ENABLE_DEV_ROUTES
    ).toBe(true)
    expect(parsePublicEnv({}).VITE_APP_NAME).toBe("Alikeni")
  })
})

describe("parseServerEnv blank values", () => {
  it("treats empty strings from .env as unset", () => {
    const env = parseServerEnv({
      NODE_ENV: "development",
      DATABASE_URL: "",
      GEOCODE_CONTACT_EMAIL: "",
      R2_ACCOUNT_ID: "",
      R2_PUBLIC_URL: "",
    })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.GEOCODE_CONTACT_EMAIL).toBeUndefined()
    expect(env.R2_ACCOUNT_ID).toBeUndefined()
  })
})

describe("payments env", () => {
  it("defaults to KES and parses a currency list", () => {
    expect(parseServerEnv({}).PAYSTACK_CURRENCIES).toEqual(["KES"])
    expect(
      parseServerEnv({ PAYSTACK_CURRENCIES: " usd, KES ,usd" })
        .PAYSTACK_CURRENCIES
    ).toEqual(["USD", "KES"])
  })

  it("rejects unknown or empty currency lists", () => {
    expect(() => parseServerEnv({ PAYSTACK_CURRENCIES: "KES,EUR" })).toThrow(
      /PAYSTACK_CURRENCIES/
    )
    expect(() => parseServerEnv({ PAYSTACK_CURRENCIES: " , " })).toThrow(
      /PAYSTACK_CURRENCIES/
    )
  })
})
