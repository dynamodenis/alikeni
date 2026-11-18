import { createFileRoute, notFound } from "@tanstack/react-router"
import { useCallback, useMemo, useRef, useState } from "react"
import { z } from "zod"
import { deepMerge } from "@/lib/deep-merge"
import { DEVICE_IDS } from "@/lib/devices"
import { postToWindow, usePreviewMessages } from "@/lib/preview-bridge"
import { MotionLevel } from "@/templates/_shared/schema"
import { hasFontPair } from "@/templates/_shared/theme/fonts"
import { hasPalette } from "@/templates/_shared/theme/palettes"
import { TemplateRenderer } from "@/templates/TemplateRenderer"
import { hasTemplate, loadTemplate } from "@/templates/loaders"

const PreviewSearch = z.object({
  device: z.enum(DEVICE_IDS).optional().catch(undefined),
  palette: z.string().max(60).refine(hasPalette).optional().catch(undefined),
  font: z.string().max(60).refine(hasFontPair).optional().catch(undefined),
  motion: MotionLevel.optional().catch(undefined),
})

const DEVICE_MAX = {
  mobile: "max-w-[390px]",
  tablet: "max-w-[820px]",
  desktop: "",
}

/**
 * Bare, chrome-free render of a template with its sample content. Used by the
 * gallery iframe, the full-screen preview link and `pnpm thumbs`. Theme
 * fields can be overridden by query string or, live, by `alikeni:theme`
 * messages from the parent page.
 */
export const Route = createFileRoute("/preview/$category/$slug")({
  validateSearch: PreviewSearch,
  loader: async ({ params }) => {
    const id = `${params.category}/${params.slug}`
    if (!hasTemplate(id)) throw notFound()
    const module = await loadTemplate(id)
    return { id, name: module.meta.name, defaults: module.defaults }
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Template"} preview · Alikeni` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
})

function PreviewPage() {
  const { id, defaults } = Route.useLoaderData()
  const search = Route.useSearch()
  // Full config pushed by the editor; theme overrides below still apply.
  const [pushed, setPushed] = useState<Record<string, unknown> | null>(null)
  const [live, setLive] = useState<{
    paletteId?: string
    fontPairId?: string
    motionLevel?: MotionLevel
  }>({})

  // Ready only when the template (not its loading skeleton) has rendered:
  // a config pushed before that would replace the server-rendered page with
  // the skeleton until the template chunk arrives.
  const mounted = useRef(false)
  const announce = useCallback(() => {
    mounted.current = true
    if (window.parent !== window) {
      postToWindow(window.parent, { type: "alikeni:ready", templateId: id })
    }
  }, [id])

  usePreviewMessages(
    () => (window.parent === window ? null : window.parent),
    (message) => {
      // Either page may hydrate first, so readiness is a handshake: the
      // preview announces itself once the template is on screen and answers
      // every ping from then on. A ping that comes earlier gets no answer;
      // the announcement follows.
      if (message.type === "alikeni:ping") {
        if (mounted.current) {
          postToWindow(window.parent, { type: "alikeni:ready", templateId: id })
        }
        return
      }
      if (message.type === "alikeni:config") {
        setPushed(message.config)
        return
      }
      if (message.type !== "alikeni:theme") return
      setLive({
        paletteId:
          message.paletteId && hasPalette(message.paletteId)
            ? message.paletteId
            : undefined,
        fontPairId:
          message.fontPairId && hasFontPair(message.fontPairId)
            ? message.fontPairId
            : undefined,
        motionLevel: message.motionLevel,
      })
    }
  )

  const config = useMemo(
    () =>
      deepMerge(pushed ?? defaults, {
        theme: {
          paletteId: live.paletteId ?? search.palette,
          fontPairId: live.fontPairId ?? search.font,
          motionLevel: live.motionLevel ?? search.motion,
        },
      }),
    [pushed, defaults, live, search.palette, search.font, search.motion]
  )

  return (
    <div
      className={
        search.device ? `mx-auto ${DEVICE_MAX[search.device]}` : undefined
      }
    >
      <TemplateRenderer
        templateId={id}
        config={config}
        mode="preview"
        onMounted={announce}
      />
    </div>
  )
}
