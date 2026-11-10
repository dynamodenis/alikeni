// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest"
import type { Email } from "@/server/email/send.server"
import { MemoryRateLimiter } from "@/server/rate-limit"
import { CONTACT_RULES, submitContact } from "./contact.server"

const sent: Array<Email> = []
const send = async (email: Email) => {
  sent.push(email)
}
const deps = () => ({ send, limiter: new MemoryRateLimiter(), ipHash: "ip-1" })

const message = {
  name: "  Wanjiru   Kamau ",
  email: " Wanjiru@Example.com ",
  subject: "  Changing   my link ",
  message: "Hello,\n\n\n\nCan I change my invitation   link after publishing?",
}

beforeEach(() => {
  sent.length = 0
})

describe("contact form", () => {
  it("emails our inbox with the visitor as Reply-To", async () => {
    expect(await submitContact(message, deps())).toEqual({ ok: true })
    expect(sent).toHaveLength(1)
    const [email] = sent
    expect(email.to).toBe("info@alikeni.com")
    expect(email.replyTo).toBe("Wanjiru@Example.com")
    expect(email.subject).toBe("Contact form: Changing my link")
    expect(email.text).toContain(
      "Hello,\n\nCan I change my invitation link after publishing?"
    )
    expect(email.text).toContain("From Wanjiru Kamau · Wanjiru@Example.com")
  })

  it("escapes the visitor's text in the HTML", async () => {
    await submitContact(
      { ...message, name: "<b>Eve</b>", message: "<script>alert(1)</script>" },
      deps()
    )
    expect(sent[0].html).not.toContain("<script>")
    expect(sent[0].html).not.toContain("<b>Eve</b>")
  })

  it("rejects a bad email address or an empty message", async () => {
    await expect(
      submitContact({ ...message, email: "not-an-email" }, deps())
    ).rejects.toThrow()
    await expect(
      submitContact({ ...message, message: "   hi  " }, deps())
    ).rejects.toThrow()
    await expect(
      submitContact({ ...message, subject: " " }, deps())
    ).rejects.toThrow()
    expect(sent).toHaveLength(0)
  })

  it("pretends to succeed for bots that fill the hidden field", async () => {
    expect(
      await submitContact(
        { ...message, website: "https://spam.example" },
        deps()
      )
    ).toEqual({ ok: true })
    expect(sent).toHaveLength(0)
  })

  it("limits how many messages one address can send", async () => {
    const shared = deps()
    for (let i = 0; i < CONTACT_RULES[0].limit; i++) {
      expect((await submitContact(message, shared)).ok).toBe(true)
    }
    const refused = await submitContact(message, shared)
    expect(refused).toMatchObject({ ok: false, reason: "rate_limited" })
    expect(sent).toHaveLength(CONTACT_RULES[0].limit)
    // Someone else is not affected.
    expect(
      (await submitContact(message, { ...shared, ipHash: "ip-2" })).ok
    ).toBe(true)
  })
})
