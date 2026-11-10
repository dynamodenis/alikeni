// Alikeni's social profiles, shown as icons in the site footer and listed in
// the Organization structured data. A profile with an empty `url` is hidden:
// paste the address here when the account exists.

export type SocialId = "instagram" | "facebook" | "x" | "tiktok"

export const SOCIAL_LINKS: ReadonlyArray<{
  id: SocialId
  /** Accessible name of the link. */
  label: string
  url: string
}> = [
  {
    id: "instagram",
    label: "Alikeni on Instagram",
    url: "https://www.instagram.com/alikeniofficial",
  },
  { id: "facebook", label: "Alikeni on Facebook", url: "" },
  { id: "x", label: "Alikeni on X (Twitter)", url: "" },
  { id: "tiktok", label: "Alikeni on TikTok", url: "" },
]

/** The inbox people write to (forwarded by Cloudflare Email Routing). */
export const CONTACT_EMAIL = "info@alikeni.com"
