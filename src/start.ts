// TanStack Start instance: global request middleware.
//
// Defining a start instance replaces Start's default middleware list, so the
// CSRF check for server functions (Start's default) is added back explicitly.
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start"
import { z } from "zod"
import { finishRequest, secureResponse } from "@/server/platform/request.server"

// Zod 4 probes `new Function("")` to decide whether to JIT-compile object
// parsers. Under our CSP (no 'unsafe-eval') the probe is blocked and the
// browser logs a violation on every page, and Workers forbid eval anyway.
// The interpreted parser is plenty fast for our forms and configs.
z.config({ jitless: true })

/**
 * Wraps every request: security headers on the response (CSP on HTML) and,
 * afterwards, per-request platform cleanup (Workers: the request's database
 * pool). Runs first so it also covers responses from later middleware.
 */
const platformMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    try {
      const result = await next()
      secureResponse(result.response)
      return result
    } finally {
      finishRequest(request)
    }
  }
)

/** Server functions are same-origin RPC; refuse cross-site calls. */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
})

export const startInstance = createStart(() => ({
  requestMiddleware: [platformMiddleware, csrfMiddleware],
}))
