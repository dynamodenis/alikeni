import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { UpgradeView } from "@/components/dashboard/UpgradeView"
import {
  confirmCheckoutFn,
  getUpgradeFn,
} from "@/server/payments/payments.functions"

/** Paystack sends the host back with `?trxref=<ref>&reference=<ref>`. */
const UpgradeSearch = z.object({
  reference: z.string().max(100).optional().catch(undefined),
  trxref: z.string().max(100).optional().catch(undefined),
})

/** Free vs Premium for one invitation, the Paystack checkout and its result. */
export const Route = createFileRoute(
  "/_authed/dashboard/$invitationId/upgrade"
)({
  validateSearch: UpgradeSearch,
  loaderDeps: ({ search }) => ({
    reference: search.reference ?? search.trxref,
  }),
  loader: async ({ params, deps }) => {
    if (!z.uuid().safeParse(params.invitationId).success) throw notFound()
    // Settle first, so the page below already shows the new plan.
    const payment = deps.reference
      ? await confirmCheckoutFn({ data: { reference: deps.reference } })
      : null
    const info = await getUpgradeFn({ data: { id: params.invitationId } })
    if (!info) throw notFound()
    return { info, payment: payment?.status ?? null }
  },
  head: () => ({
    meta: [
      { title: "Premium · Festly" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UpgradePage,
})

function UpgradePage() {
  const { info, payment } = Route.useLoaderData()
  return (
    <DashboardShell back>
      <UpgradeView info={info} payment={payment} />
    </DashboardShell>
  )
}
