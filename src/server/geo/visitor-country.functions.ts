// The visitor's country, for showing prices in a currency they know. Costs
// no request of its own: during the page's own server render it reads the
// country Cloudflare puts on every request; in the browser (a later in-app
// navigation) it guesses from the device's time zone. Null when unknown,
// which includes local development. A display hint only: what someone pays
// is decided on the upgrade page and checked on the server.
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

/** IANA zones that mean "in Kenya" well enough for a price label. */
const KENYA_ZONES = new Set(["Africa/Nairobi"])

/** Two-letter country code in upper case, or null. */
export const visitorCountry = createIsomorphicFn()
  .server((): string | null => {
    const country = new Headers(getRequestHeaders()).get("cf-ipcountry")
    return country ? country.toUpperCase() : null
  })
  .client((): string | null => {
    try {
      const zone = new Intl.DateTimeFormat().resolvedOptions().timeZone
      return KENYA_ZONES.has(zone) ? "KE" : null
    } catch {
      return null
    }
  })
