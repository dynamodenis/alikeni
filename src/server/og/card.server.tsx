// The OG card layout (1200×630), rendered by satori. Satori supports a
// flexbox subset of CSS: every element with children needs display:flex.
import type { CSSProperties } from "react"
import { BODY_FAMILY, DISPLAY_FAMILY } from "./fonts.server"

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
const PHOTO_WIDTH = 460

export type OgCardProps = {
  colors: { background: string; foreground: string; primary: string }
  /** Small line above the title, e.g. the event title when the headline differs. */
  eyebrow?: string
  title: string
  date: string
  place?: string
  /** A data: URL; the card fills the right side with it. */
  photo?: string
}

/** Hard cap so nothing can overflow even before `lineClamp` kicks in. */
export function clampText(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim()
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

/** Smaller type for longer titles; three lines at most either way. */
export function titleSize(title: string, narrow: boolean): number {
  const n = title.length
  const scale = narrow ? 0.82 : 1
  const base = n <= 18 ? 96 : n <= 32 ? 80 : n <= 56 ? 64 : 52
  return Math.round(base * scale)
}

export function OgCard(props: OgCardProps) {
  const { colors } = props
  const narrow = !!props.photo
  const title = clampText(props.title, 90)
  const size = titleSize(title, narrow)
  const muted: CSSProperties = { opacity: 0.78 }

  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: BODY_FAMILY,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 52px",
          borderLeft: `16px solid ${colors.primary}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {props.eyebrow ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: colors.primary,
                marginBottom: 20,
                lineClamp: 1,
              }}
            >
              {clampText(props.eyebrow, 60)}
            </div>
          ) : null}
          <div
            style={{
              display: "block",
              fontFamily: DISPLAY_FAMILY,
              fontSize: size,
              lineHeight: 1.08,
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              width: 96,
              height: 4,
              marginTop: 32,
              backgroundColor: colors.primary,
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 34, lineClamp: 1 }}>
            {clampText(props.date, 48)}
          </div>
          {props.place ? (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                marginTop: 10,
                lineClamp: 1,
                ...muted,
              }}
            >
              {clampText(props.place, 60)}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: 1,
              color: colors.primary,
            }}
          >
            festly
          </div>
        </div>
      </div>
      {props.photo ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- rasterised by satori, never in the DOM
        <img
          src={props.photo}
          width={PHOTO_WIDTH}
          height={OG_HEIGHT}
          style={{ width: PHOTO_WIDTH, height: OG_HEIGHT, objectFit: "cover" }}
        />
      ) : null}
    </div>
  )
}
