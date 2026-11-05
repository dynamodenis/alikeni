import { Link, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Check,
  CircleAlert,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  CURRENCIES,
  FREE_RSVP_LIMIT,
  formatPrice,
  type Currency,
} from "@/lib/plans"
import { cn } from "@/lib/utils"
import { startCheckoutFn } from "@/server/payments/payments.functions"
import type {
  confirmCheckoutFn,
  getUpgradeFn,
} from "@/server/payments/payments.functions"

type UpgradeInfo = NonNullable<Awaited<ReturnType<typeof getUpgradeFn>>>
type PaymentStatus = Awaited<ReturnType<typeof confirmCheckoutFn>>["status"]

const CHANNELS: Record<Currency, string> = {
  KES: "M-Pesa or card",
  USD: "Card or Apple Pay",
}

const day = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})
/** "13 Dec 2026" from "2026-12-13". */
const formatDay = (value: string) => day.format(new Date(`${value}T00:00:00Z`))

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : "Please try again."

export function UpgradeView({
  info,
  payment,
}: {
  info: UpgradeInfo
  payment: PaymentStatus | null
}) {
  const router = useRouter()
  const start = useServerFn(startCheckoutFn)
  const [currency, setCurrency] = useState<Currency>(info.suggestedCurrency)
  const [busy, setBusy] = useState(false)
  const premium = info.plan === "premium"

  const pay = async () => {
    setBusy(true)
    try {
      const { url } = await start({ data: { id: info.id, currency } })
      window.location.assign(url)
    } catch (error) {
      toast.error("Could not start the payment", {
        description: errorText(error),
      })
      setBusy(false)
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Premium</p>
        <h1 className="truncate font-display text-3xl sm:text-4xl">
          {info.title}
        </h1>
      </div>

      {premium ? (
        <Notice tone="success" icon={Check}>
          <p className="font-medium">
            {payment === "paid"
              ? "Payment received. Thank you!"
              : "This invitation is Premium."}
          </p>
          <p className="text-muted-foreground">
            The page stays online after the event, RSVPs are unlimited and the
            gift section is shown to guests.
            {info.paid &&
              ` Paid ${new Intl.NumberFormat("en", {
                style: "currency",
                currency: info.paid.currency,
                maximumFractionDigits: 0,
              }).format(info.paid.amount / 100)}${
                info.paid.paidAt
                  ? ` on ${formatDay(info.paid.paidAt.slice(0, 10))}`
                  : ""
              }.`}
          </p>
        </Notice>
      ) : payment === "pending" ? (
        <Notice tone="info" icon={LoaderCircle}>
          <p className="font-medium">Waiting for Paystack to confirm</p>
          <p className="text-muted-foreground">
            This usually takes a few seconds. M-Pesa payments finish once you
            approve the prompt on your phone.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-fit"
            onClick={() => void router.invalidate()}
          >
            <RefreshCw aria-hidden="true" /> Check again
          </Button>
        </Notice>
      ) : payment === "failed" ? (
        <Notice tone="warning" icon={CircleAlert}>
          <p className="font-medium">The payment did not go through</p>
          <p className="text-muted-foreground">
            Please try again. If you were charged, contact us with the reference
            from your Paystack receipt.
          </p>
        </Notice>
      ) : info.ended ? (
        <Notice tone="warning" icon={CircleAlert}>
          <p className="font-medium">The public page is offline</p>
          <p className="text-muted-foreground">
            Free invitations go offline the day after the event. Upgrade to
            bring it back right away; responses and wishes are kept.
          </p>
        </Notice>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard
          name="Free"
          current={!premium}
          items={[
            info.onlineUntil
              ? `Page online until ${formatDay(info.onlineUntil)} (the day after the event)`
              : "Page online until the day after the event",
            `Up to ${FREE_RSVP_LIMIT} RSVPs (${info.responses} so far)`,
            "No gift section",
          ]}
        />
        <PlanCard
          name="Premium"
          current={premium}
          highlight
          items={[
            "Page stays online after the event",
            "Unlimited RSVPs",
            "Gift section: bank accounts, M-Pesa, QR code, registry links",
            "One-time payment for this invitation",
          ]}
        />
      </div>

      {!premium && (
        <section aria-labelledby="pay-heading" className="flex flex-col gap-4">
          <h2 id="pay-heading" className="font-display text-2xl">
            Upgrade this invitation
          </h2>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm text-muted-foreground">
              Pay in
            </legend>
            {CURRENCIES.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  currency === option
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name="currency"
                  value={option}
                  checked={currency === option}
                  onChange={() => setCurrency(option)}
                  className="accent-primary"
                />
                <span className="flex flex-col">
                  <span className="font-medium">{formatPrice(option)}</span>
                  <span className="text-sm text-muted-foreground">
                    {CHANNELS[option]}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              disabled={busy || !info.paymentsEnabled}
              onClick={() => void pay()}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles aria-hidden="true" />
              )}
              Pay {formatPrice(currency)} with Paystack
            </Button>
            <p className="text-sm text-muted-foreground">
              {info.paymentsEnabled
                ? "You will finish the payment on Paystack and come back here."
                : "Payments are not available yet."}
            </p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/editor/$invitationId" params={{ invitationId: info.id }}>
            Back to the editor
          </Link>
        </Button>
        {info.live && info.slug && (
          <Button asChild variant="outline">
            <a href={`/i/${info.slug}`} target="_blank" rel="noopener">
              View live
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}

function PlanCard({
  name,
  items,
  current,
  highlight,
}: {
  name: string
  items: Array<string>
  current: boolean
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-5",
        highlight ? "border-primary/50" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl">{name}</h2>
        {current && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
            Current plan
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Check
              className={cn(
                "mt-0.5 size-4 shrink-0",
                highlight ? "text-primary" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Notice({
  tone,
  icon: Icon,
  children,
}: {
  tone: "success" | "info" | "warning"
  icon: typeof Check
  children: ReactNode
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-2xl border p-4 text-sm",
        tone === "success" && "border-emerald-500/40 bg-emerald-500/10",
        tone === "info" && "border-border bg-muted/50",
        tone === "warning" && "border-amber-500/40 bg-amber-500/10"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "info" && "animate-spin"
        )}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}
