import { en } from "@/lib/i18n/en"
import type { Host } from "../schema"

/** English role labels; blocks read the invitation's locale via `t.hosts`. */
export const ROLE_LABEL: Record<Host["role"], string> = en.hosts

/** "Amara & Kofi" from short names (falls back to full names). */
export function hostNames(hosts: ReadonlyArray<Host>, joiner = " & "): string {
  return hosts.map((h) => h.shortName ?? h.name).join(joiner)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
