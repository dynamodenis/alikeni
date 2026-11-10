// One public address: `www.<domain>` answers with a permanent redirect to
// APP_ORIGIN, keeping path and query. Sign-in cookies and auth callbacks only
// work on APP_ORIGIN, so serving the app on both hosts would break them.

/** The URL to redirect to, or null when the request is already canonical. */
export function canonicalRedirect(
  requestUrl: string,
  appOrigin: string
): string | null {
  let url: URL
  let canonical: URL
  try {
    url = new URL(requestUrl)
    canonical = new URL(appOrigin)
  } catch {
    return null
  }
  if (url.hostname !== `www.${canonical.hostname}`) return null
  return `${canonical.origin}${url.pathname}${url.search}`
}
