import { describe, expect, it } from "vitest"
import { isStaleBuildError } from "./RouteError"

describe("isStaleBuildError", () => {
  it("recognises a missing script or style file in each browser's wording", () => {
    for (const message of [
      "Failed to fetch dynamically imported module: https://alikeni.com/assets/album-abc.js",
      "error loading dynamically imported module: https://alikeni.com/assets/x.js",
      "Importing a module script failed.",
      "Unable to preload CSS for /assets/styles-abc.css",
    ]) {
      expect(isStaleBuildError(new TypeError(message))).toBe(true)
    }
  })

  it("leaves real errors alone", () => {
    expect(isStaleBuildError(new Error("Invitation not found"))).toBe(false)
    expect(isStaleBuildError(undefined)).toBe(false)
  })
})
