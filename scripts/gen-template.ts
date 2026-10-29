// pnpm gen:template --id <category>/<slug> --name "Display Name" --base <category>/<slug>
//   [--palette <paletteId>] [--font <fontPairId>] [--tags "a,b,c"] [--description "..."]
//
// Scaffolds a new template from an existing one:
//   src/templates/<category>/<slug>/{meta,schema,defaults,index}.ts(x)
// registers it in src/templates/registry.ts, removes it from the
// "coming soon" list in src/templates/catalog.ts, and copies the base's
// thumbnail as a placeholder (replace with `pnpm thumbs --only <id>`).
//
// Seed rows derive from the registry, so nothing else needs editing.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join } from "node:path"

const TEMPLATES_DIR = join("src", "templates")
const CATEGORIES = [
  "wedding",
  "birthday",
  "graduation",
  "baby_shower",
  "anniversary",
  "corporate",
  "other",
] as const

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}

function fail(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function pascal(slug: string): string {
  return slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("")
}

function camel(slug: string): string {
  const p = pascal(slug)
  return p[0].toLowerCase() + p.slice(1)
}

function parseId(id: string, label: string) {
  const match = /^([a-z_]+)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(id)
  if (!match) fail(`${label} must look like <category>/<slug>, got "${id}"`)
  const [, category, slug] = match
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number]))
    fail(`${label}: unknown category "${category}"`)
  return { category: category as (typeof CATEGORIES)[number], slug }
}

async function main() {
  const id = flag("id") ?? fail("--id is required")
  const name = flag("name") ?? fail("--name is required")
  const baseId = flag("base") ?? fail("--base is required")
  const { category, slug } = parseId(id, "--id")
  const base = parseId(baseId, "--base")

  const dir = join(TEMPLATES_DIR, category, slug)
  const baseDir = join(TEMPLATES_DIR, base.category, base.slug)
  if (!existsSync(join(baseDir, "index.tsx")))
    fail(`base template not found at ${baseDir}`)
  if (existsSync(dir)) fail(`${dir} already exists`)

  const baseMetaSrc = await readFile(join(baseDir, "meta.ts"), "utf8")
  const baseIndexSrc = await readFile(join(baseDir, "index.tsx"), "utf8")
  const baseSchemaSrc = await readFile(join(baseDir, "schema.ts"), "utf8")
  const baseDefaultsSrc = await readFile(join(baseDir, "defaults.ts"), "utf8")

  const pick = (key: string, fallback: string) =>
    new RegExp(`${key}:\\s*"([^"]+)"`).exec(baseMetaSrc)?.[1] ?? fallback
  const palette = flag("palette") ?? pick("defaultPaletteId", "ivory-gold")
  const font = flag("font") ?? pick("defaultFontPairId", "playfair-inter")
  const tags = (flag("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  const description =
    flag("description") ??
    `${name}: describe the signature of this template in one sentence.`

  // Everything after the required keys is copied from the base so the new
  // template starts with working radius / ornament / effects values.
  const extras = baseMetaSrc
    .split("\n")
    .filter((line) =>
      /^\s+(radius|ornament|grain|effects|supportedEventTypes):/.test(line)
    )
    .join("\n")

  const Pascal = pascal(slug)
  const basePascal = pascal(base.slug)
  const typeName = `${Pascal}Config`
  const baseTypeName =
    /export type (\w+Config)\b/.exec(baseSchemaSrc)?.[1] ??
    `${basePascal}Config`

  const metaSrc = `import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "${id}",
  name: "${name}",
  category: "${category}",
  tags: ${JSON.stringify(tags)},
  description:
    "${description.replace(/"/g, '\\"')}",
  thumbnail: "/thumbs/${category}-${slug}.webp",
  isPremium: false,
${extras}
  defaultPaletteId: "${palette}",
  defaultFontPairId: "${font}",
}
`

  const schemaSrc = baseSchemaSrc
    .replaceAll(baseTypeName, typeName)
    .replace(
      /\/\*\* [^*]*uses the shared config unchanged\. \*\//,
      `/** ${name} uses the shared config unchanged. */`
    )

  const defaultsSrc = baseDefaultsSrc
    .replace(/paletteId: "[^"]+"/, `paletteId: "${palette}"`)
    .replace(/fontPairId: "[^"]+"/, `fontPairId: "${font}"`)

  const indexSrc = baseIndexSrc
    .replaceAll(baseTypeName, typeName)
    .replaceAll(new RegExp(`\\b${basePascal}\\b`, "g"), Pascal)

  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, "meta.ts"), metaSrc)
  await writeFile(join(dir, "schema.ts"), schemaSrc)
  await writeFile(join(dir, "defaults.ts"), defaultsSrc)
  await writeFile(join(dir, "index.tsx"), indexSrc)

  // Template-local helper components (AgeBadge, Diploma, …) referenced by
  // the base index are copied too, so the scaffold compiles immediately.
  for (const m of baseIndexSrc.matchAll(/from "\.\/([A-Z]\w+)"/g)) {
    const file = `${m[1]}.tsx`
    if (existsSync(join(baseDir, file)))
      await copyFile(join(baseDir, file), join(dir, file))
  }

  await registerInRegistry(id, category, slug)
  await removeFromUpcoming(name)

  // Placeholder thumbnail so registry.test.ts passes before `pnpm thumbs`.
  const baseThumb = /thumbnail:\s*"([^"]+)"/.exec(baseMetaSrc)?.[1]
  const thumb = join("public", "thumbs", `${category}-${slug}.webp`)
  if (baseThumb && existsSync(join("public", baseThumb))) {
    await copyFile(join("public", baseThumb), thumb)
  }

  console.log(`✓ ${id} scaffolded from ${baseId}`)
  console.log(`  ${dir}/{meta,schema,defaults}.ts + index.tsx`)
  console.log(`  registered in ${join(TEMPLATES_DIR, "registry.ts")}`)
  console.log(`  placeholder thumbnail at ${thumb}`)
  console.log(`\nNext:`)
  console.log(`  1. edit meta.ts (description, tags, effects) and index.tsx`)
  console.log(`  2. pnpm dev, then pnpm thumbs --only ${id}`)
  console.log(`  3. pnpm typecheck && pnpm lint && pnpm test`)
}

async function registerInRegistry(id: string, category: string, slug: string) {
  const file = join(TEMPLATES_DIR, "registry.ts")
  let src = await readFile(file, "utf8")
  if (src.includes(`"${id}"`)) fail(`${id} is already in registry.ts`)
  const alias = camel(slug)
  const importLine = `import { meta as ${alias} } from "./${category}/${slug}/meta"`

  // Imports: after the last `import { meta as … }` line.
  const imports = [...src.matchAll(/^import \{ meta as \w+ \} from ".*"\n/gm)]
  const last = imports.at(-1)
  if (!last) fail("registry.ts: could not find the meta imports")
  const at = last.index + last[0].length
  src = `${src.slice(0, at)}${importLine}\n${src.slice(at)}`

  // Metas array: before its closing bracket.
  src = src.replace(
    /(export const TEMPLATE_METAS: ReadonlyArray<TemplateMeta> = \[[\s\S]*?)(\n\])/,
    `$1\n  ${alias},$2`
  )

  // Loaders: before the closing brace of the object.
  src = src.replace(
    /(const loaders: Partial<Record<string, Loader>> = \{[\s\S]*?)(\n\})/,
    `$1\n  "${id}": () => import("./${category}/${slug}"),$2`
  )

  if (!src.includes(`  ${alias},`) || !src.includes(`"${id}": () =>`))
    fail("registry.ts: insertion failed; register the template by hand")
  await writeFile(file, src)
}

async function removeFromUpcoming(name: string) {
  const file = join(TEMPLATES_DIR, "catalog.ts")
  const src = await readFile(file, "utf8")
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const line = new RegExp(`^\\s+"${escaped}",\\n`, "m")
  // Prettier may keep a short list on one line: `["wedding", ["A", "B"]]`.
  const inline = new RegExp(`(, )?"${escaped}"(?!\\w)(, )?`)
  let next: string
  if (line.test(src)) next = src.replace(line, "")
  else if (inline.test(src.slice(src.indexOf("UPCOMING_TEMPLATES")))) {
    const start = src.indexOf("UPCOMING_TEMPLATES")
    next =
      src.slice(0, start) +
      src
        .slice(start)
        .replace(inline, (_m, before, after) => (before && after ? ", " : ""))
  } else {
    console.log(`  (not in UPCOMING_TEMPLATES: "${name}")`)
    return
  }
  await writeFile(file, next)
  console.log(`  removed "${name}" from UPCOMING_TEMPLATES`)
}

await main()
