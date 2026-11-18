// Which responses the Worker may keep in Cloudflare's edge cache. A Worker
// runs in front of the CDN cache, so nothing is stored unless the Worker
// does it (src/worker.ts). A hit costs no rendering and no database query,
// which is what keeps a popular invitation inside the Workers CPU limit.
//
// Only the public invitation page is cached. It is the same for every
// visitor (the `?to=` guest name is part of the URL, so part of the key) and
// already declares how long shared caches may keep it (`s-maxage`). A
// republish, a new wish or a free page going offline therefore shows within
// that time (60 s today, set in `src/routes/i/$slug.tsx`).

/** The cache key for a request that may be answered from cache, else null. */
export function edgeCacheKey(request: Request): string | null {
  if (request.method !== "GET") return null
  if (request.headers.has("range")) return null
  const url = new URL(request.url)
  // `/i/<slug>` only: the album under it is per-visitor and interactive.
  if (!/^\/i\/[^/]+\/?$/.test(url.pathname)) return null
  url.hash = ""
  return url.toString()
}

/** Whether a rendered response may be stored under that key. */
export function isEdgeCacheable(response: Response): boolean {
  if (response.status !== 200) return false
  if (response.headers.has("set-cookie")) return false
  const control = response.headers.get("cache-control") ?? ""
  return /\bpublic\b/.test(control) && /\bs-maxage=[1-9]\d*/.test(control)
}
