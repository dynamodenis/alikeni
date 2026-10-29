import { cn } from "@/lib/utils"

/**
 * Housewarming Keys' crest: a house outline with a door and a window, and a
 * key lying beneath it. Pure SVG in the primary token.
 */
export function HouseKey({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-20 text-inv-primary", className)}
    >
      <path d="M18 44 50 16l32 28" />
      <path d="M26 38v28h48V38" />
      <path d="M64 24v-6h7v12" />
      <path d="M44 66V50h12v16" />
      <circle cx="53" cy="58.5" r="1" fill="currentColor" />
      <rect x="30" y="44" width="9" height="9" rx="1" />
      <path d="M30 48.5h9M34.5 44v9" strokeWidth="1.2" />
      <circle cx="31" cy="83" r="7" />
      <circle cx="31" cy="83" r="2.4" />
      <path d="M38 83h36M66 83v6M72 83v5" />
    </svg>
  )
}
