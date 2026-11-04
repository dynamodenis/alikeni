import { describe, expect, it } from "vitest"
import { en } from "./en"
import { INTL_LOCALE, LOCALES, getMessages, isLocale } from "./index"

type Tree = { [key: string]: unknown }

/** Dotted paths of every leaf (string or function) in a messages object. */
function leaves(tree: Tree, prefix = ""): Array<string> {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? leaves(value as Tree, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  )
}

function leafAt(tree: Tree, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, key) => (node as Tree | undefined)?.[key], tree)
}

describe("i18n", () => {
  it("every locale has exactly the English keys with the same kinds", () => {
    const keys = leaves(en)
    for (const locale of LOCALES) {
      const messages = getMessages(locale)
      expect(leaves(messages).sort()).toEqual([...keys].sort())
      for (const key of keys) {
        expect(typeof leafAt(messages, key), `${locale}.${key}`).toBe(
          typeof leafAt(en, key)
        )
      }
    }
  })

  it("translates Indonesian strings rather than copying English", () => {
    const id = getMessages("id")
    // Brand names and "RSVP" may stay; ordinary copy must differ.
    const same = leaves(en).filter((key) => {
      const a = leafAt(en, key)
      return typeof a === "string" && a !== "" && a === leafAt(id, key)
    })
    expect(same.sort()).toEqual(["calendar.ics", "rsvp.eyebrow"])
  })

  it("interpolates and pluralises", () => {
    expect(getMessages("en").countdown.daysToGo(1)).toBe("1 day to go.")
    expect(getMessages("en").countdown.daysToGo(3)).toBe("3 days to go.")
    expect(getMessages("id").countdown.daysToGo(3)).toBe("3 hari lagi.")
    expect(getMessages("id").gallery.photoN(2, 5)).toBe("Foto 2 dari 5")
  })

  it("falls back to English and maps Intl tags", () => {
    expect(getMessages(undefined)).toBe(en)
    expect(INTL_LOCALE.id).toBe("id-ID")
    expect(isLocale("id")).toBe(true)
    expect(isLocale("fr")).toBe(false)
  })
})
