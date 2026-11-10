// Session reads for routes. Safe to import from route files: the build swaps
// handlers for RPC stubs in the client bundle.
import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { getDb } from "@/server/db/client.server"
import { accounts } from "@/server/db/schema"
import { authMethods } from "./auth.server"
import { currentUser } from "./current-user.server"

/** The signed-in user (or null) plus which sign-in methods are configured. */
export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => ({
    user: await currentUser(getDb()),
    methods: authMethods(),
  })
)

/** Sign-in methods already attached to the signed-in user, e.g. ["credential", "google"]. */
export const getLinkedProvidersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = getDb()
    const user = await currentUser(db)
    if (!user) return []
    const rows = await db
      .select({ providerId: accounts.providerId })
      .from(accounts)
      .where(eq(accounts.userId, user.id))
    return rows.map((row) => row.providerId)
  }
)
