import { cn } from "@/lib/utils"

/** Sixteen ray lines around the disc, computed once at module load. */
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2
  const inner = i % 2 === 0 ? 30 : 34
  const outer = i % 2 === 0 ? 46 : 42
  return {
    x1: (50 + inner * Math.cos(a)).toFixed(2),
    y1: (50 + inner * Math.sin(a)).toFixed(2),
    x2: (50 + outer * Math.cos(a)).toFixed(2),
    y2: (50 + outer * Math.sin(a)).toFixed(2),
  }
})

/**
 * Boho Terracotta's signature: a desert sun. A ring of thin rays spins very
 * slowly (CSS, switched off by the motion level) around a static half-disc
 * sitting on a horizon line. Pure SVG in the primary color.
 */
export function BohoSun({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative size-24 text-inv-primary", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="inv-anim-spin absolute inset-0 [--d:90s]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        {RAYS.map((r, i) => (
          <line key={i} {...r} strokeWidth={i % 2 === 0 ? 1.6 : 0.9} />
        ))}
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0">
        <path d="M28 52a22 22 0 0 1 44 0Z" fill="currentColor" />
        <path
          d="M22 56h56"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M30 62h40"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
