// pnpm brand:icons
//
// Draws the Alikeni mark (a gold italic "A" in a gold ring on ink, the same
// look as the nav logo) and writes every icon the site and third parties
// (Google sign-in branding, phones, browsers) need into public/:
//
//   favicon.svg            the mark, round, transparent corners
//   favicon.ico            16, 32 and 48 px
//   apple-touch-icon.png   180 px, square (iOS rounds it)
//   icon-192.png, icon-512.png   square, for the web manifest and Google
//   logo.svg               mark + "Alikeni" wordmark (cream) for dark grounds:
//                          the site header
//   logo-email.png         the same with a dark wordmark, for email headers
//   og-default.png         1200×630 share card for the marketing pages
//
// The letter is converted to an outline (satori), so no file depends on a
// font being installed. Rerun after changing the constants below.
import { readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { Resvg, initWasm } from "@resvg/resvg-wasm"
import satori from "satori"

const INK = "#110b07"
const GOLD = "#c9a05a"
const CREAM = "#f3e8d6"
const BARK = "#2a1e14"

const require = createRequire(import.meta.url)
const font = (file: string) =>
  readFile(
    require.resolve(`@fontsource-variable/playfair-display/files/${file}`)
  )

await initWasm(readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")))
const italic = await font("playfair-display-latin-wght-italic.woff2")
const upright = await font("playfair-display-latin-wght-normal.woff2")

type Outline = {
  d: string
  x: number
  y: number
  width: number
  height: number
}

/** `text` as SVG path data plus its ink bounding box. */
async function outline(
  text: string,
  data: Buffer,
  style: "normal" | "italic",
  fontSize: number
): Promise<Outline> {
  const size = Math.ceil(fontSize * (text.length + 1))
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Playfair",
          fontStyle: style,
          fontSize,
          color: "#000",
        },
        children: text,
      },
      key: null,
    },
    {
      width: size,
      height: size,
      fonts: [{ name: "Playfair", data, style, weight: 400 }],
    }
  )
  const d = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"/g)]
    .map((match) => match[1])
    .join(" ")
  if (!d) throw new Error(`satori drew no outline for "${text}"`)
  const box = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><path d="${d}"/></svg>`
  ).getBBox()
  if (!box) throw new Error("empty outline")
  return { d, x: box.x, y: box.y, width: box.width, height: box.height }
}

/** The outline scaled to `height` and centred on (cx, cy). */
function place(
  o: Outline,
  cx: number,
  cy: number,
  height: number,
  fill: string
) {
  const scale = height / o.height
  const tx = cx - (o.x + o.width / 2) * scale
  const ty = cy - (o.y + o.height / 2) * scale
  return `<path fill="${fill}" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(4)})" d="${o.d}"/>`
}

const letter = await outline("A", italic, "italic", 400)
const word = await outline("Alikeni", upright, "normal", 200)

/** The mark on a 512 canvas: round with transparent corners, or full square. */
function mark(shape: "round" | "square") {
  const ground =
    shape === "round"
      ? `<circle cx="256" cy="256" r="256" fill="${INK}"/>`
      : `<rect width="512" height="512" fill="${INK}"/>`
  // The square version keeps the ring clear of the corners phones cut off.
  const ring = shape === "round" ? 226 : 196
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${ground}
<circle cx="256" cy="256" r="${ring}" fill="none" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="10"/>
${place(letter, 250, 256, ring * 1.2, GOLD)}
</svg>
`
}

/** Mark + wordmark, for places that want the full logo on a dark ground. */
function lockup(wordColor: string) {
  const wordHeight = 240
  const wordWidth = (word.width / word.height) * wordHeight
  const width = Math.ceil(512 + 96 + wordWidth + 16)
  const inner = mark("round")
    .replace(/<svg[^>]*>/, "")
    .replace("</svg>", "")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 512" width="${width}" height="512">
${inner.trim()}
${place(word, 512 + 96 + wordWidth / 2, 256, wordHeight, wordColor)}
</svg>
`
}

const png = (svg: string, size: number) =>
  Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: size } }).render().asPng()
  )

/** An .ico holding PNG images (every browser since IE 11 reads those). */
function ico(images: Array<{ size: number; data: Buffer }>) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + 16 * images.length
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size, 0)
    entry.writeUInt8(size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

const round = mark("round")
const square = mark("square")
const out = (name: string) => new URL(`../public/${name}`, import.meta.url)

await writeFile(out("favicon.svg"), round)
await writeFile(
  out("favicon.ico"),
  ico([16, 32, 48].map((size) => ({ size, data: png(round, size) })))
)
await writeFile(out("apple-touch-icon.png"), png(square, 180))
await writeFile(out("icon-192.png"), png(square, 192))
await writeFile(out("icon-512.png"), png(square, 512))
await writeFile(out("logo.svg"), lockup(CREAM))
// Email clients do not render SVG, and emails have a white card: a PNG with
// a dark wordmark, twice the 40 px it is shown at.
await writeFile(
  out("logo-email.png"),
  Buffer.from(
    new Resvg(lockup(BARK), { fitTo: { mode: "height", value: 80 } })
      .render()
      .asPng()
  )
)
// The share card (og:image) for the home and template pages: 1200×630.
const tagline = await outline(
  "Online invitations with RSVP",
  upright,
  "normal",
  60
)
const lockupSvg = lockup(CREAM)
const lockupWidth = Number(/viewBox="0 0 (\d+) 512"/.exec(lockupSvg)?.[1])
const lockupScale = 190 / 512
const card = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
<defs><radialGradient id="glow" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#3a2716"/><stop offset="0.6" stop-color="#1a120c"/><stop offset="1" stop-color="${INK}"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#glow)"/>
<rect x="28" y="28" width="1144" height="574" rx="28" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>
<g transform="translate(${(600 - (lockupWidth * lockupScale) / 2).toFixed(1)} 170) scale(${lockupScale.toFixed(4)})">
${lockupSvg
  .replace(/<svg[^>]*>/, "")
  .replace("</svg>", "")
  .trim()}
</g>
${place(tagline, 600, 450, 44, GOLD)}
</svg>
`
await writeFile(out("og-default.png"), png(card, 1200))
console.log(
  "Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, logo.svg, logo-email.png, og-default.png to public/"
)
