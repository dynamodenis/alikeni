// Transactional email bodies: one short message and one button, in the
// brand's gold on ivory. Inline styles only (email clients ignore <style>).
import type { Email } from "./send.server"

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/**
 * The header logo (public/logo-email.png, from `pnpm brand:icons`). Always
 * the production URL: an email client cannot load an image from localhost.
 * Clients that block images show the alt text in the old header style.
 */
const LOGO_URL = "https://alikeni.com/logo-email.png"

const ACCOUNT_FOOTER =
  "You received this because someone used this address on Alikeni. If it was not you, ignore this email."

type Message = {
  to: string
  subject: string
  heading: string
  /** One paragraph per entry. */
  body: Array<string>
  action: string
  url: string
  /** Why the person is getting this email (small print under the card). */
  footer?: string
}

function layout({ heading, body, action, url, footer }: Message) {
  const paragraphs = body
    .map(
      (line, index) =>
        `<p style="margin:0 0 ${index === body.length - 1 ? 24 : 12}px;font-size:15px;line-height:1.6">${escape(line)}</p>`
    )
    .join("\n")
  return `<!doctype html>
<html><body style="margin:0;background:#f8f3ea;font-family:Helvetica,Arial,sans-serif;color:#2a1e14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e9dcc4;border-radius:12px">
<tr><td style="padding:32px">
<p style="margin:0 0 24px"><img src="${LOGO_URL}" alt="Alikeni" width="122" height="40" style="display:block;border:0;height:40px;width:122px;font-family:Georgia,serif;font-size:22px;color:#a8783a"></p>
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:24px;font-weight:normal">${escape(heading)}</h1>
${paragraphs}
<a href="${escape(url)}" style="display:inline-block;background:#a8783a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px">${escape(action)}</a>
<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#7a6a58">If the button does not work, paste this link into your browser:<br>${escape(url)}</p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#7a6a58">${escape(footer ?? ACCOUNT_FOOTER)}</p>
</td></tr></table>
</body></html>`
}

function message(input: Message): Email {
  const { to, subject, heading, body, action, url } = input
  return {
    to,
    subject,
    text: `${heading}\n\n${body.join("\n\n")}\n\n${action}: ${url}\n`,
    html: layout(input),
  }
}

export const resetPasswordEmail = (to: string, url: string) =>
  message({
    to,
    subject: "Reset your Alikeni password",
    heading: "Reset your password",
    body: [
      "Use the button below to choose a new password. The link expires in one hour.",
    ],
    action: "Choose a new password",
    url,
  })

export const verifyEmail = (to: string, url: string) =>
  message({
    to,
    subject: "Confirm your email for Alikeni",
    heading: "Confirm your email",
    body: [
      "Confirm this address so we can send you RSVP updates and receipts.",
    ],
    action: "Confirm email",
    url,
  })

/* ---------- RSVP updates for the owner ---------- */

export type RsvpLine = {
  guestName: string
  attending: "yes" | "no" | "maybe"
  partySize: number
  message: string | null
}

/** Responses listed one by one before the rest is summed up as "and N more". */
export const DIGEST_LISTED = 10

const ANSWER = { yes: "coming", no: "not coming", maybe: "maybe" } as const

function rsvpLine(rsvp: RsvpLine): string {
  const party =
    rsvp.attending !== "no" && rsvp.partySize > 1
      ? ` (party of ${rsvp.partySize})`
      : ""
  const note = rsvp.message
    ? `: "${rsvp.message.length > 140 ? `${rsvp.message.slice(0, 139)}…` : rsvp.message}"`
    : ""
  return `${rsvp.guestName} · ${ANSWER[rsvp.attending]}${party}${note}`
}

/** One email for every response since the last one (newest last). */
export function rsvpDigestEmail(input: {
  to: string
  title: string
  rsvps: Array<RsvpLine>
  url: string
}): Email {
  const { to, title, rsvps, url } = input
  const count = rsvps.length
  const heading =
    count === 1
      ? `${rsvps[0].guestName} replied to ${title}`
      : `${count} new RSVPs for ${title}`
  const rest = count - DIGEST_LISTED
  return message({
    to,
    subject: heading,
    heading: count === 1 ? "New RSVP" : `${count} new RSVPs`,
    body: [
      ...(count === 1 ? [] : [title]),
      ...rsvps.slice(0, DIGEST_LISTED).map(rsvpLine),
      ...(rest > 0 ? [`…and ${rest} more.`] : []),
    ],
    action: "View responses",
    url,
    footer:
      "You received this because guests replied to an invitation you published on Alikeni.",
  })
}

/* ---------- event reminder for a guest ---------- */

export function eventReminderEmail(input: {
  to: string
  guestName: string
  title: string
  /** Already formatted in the event's time zone. */
  date: string
  time: string
  timezone: string
  venue: string
  url: string
}): Email {
  const { to, guestName, title, date, time, timezone, venue, url } = input
  return message({
    to,
    subject: `Reminder: ${title} is on ${date}`,
    heading: title,
    body: [
      `Hi ${guestName}, this is a reminder that ${title} is coming up.`,
      `${date}, ${time} (${timezone})`,
      ...(venue ? [venue] : []),
    ],
    action: "Open the invitation",
    url,
    footer:
      "You received this because you replied to this invitation with this email address. It is the only reminder.",
  })
}

/* ---------- contact form → our inbox ---------- */

/** A message from the site's contact form. Replying answers the visitor. */
export function contactEmail(input: {
  to: string
  name: string
  email: string
  subject: string
  message: string
}): Email {
  const { to, name, email, subject, message: text } = input
  return {
    ...message({
      to,
      subject: `Contact form: ${subject}`,
      heading: subject,
      body: [...text.split(/\n{2,}/), `From ${name} · ${email}`],
      action: `Reply to ${name}`,
      url: `mailto:${email}`,
      footer: "Sent from the contact form on alikeni.com.",
    }),
    replyTo: email,
  }
}
