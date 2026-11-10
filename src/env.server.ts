// Server-only environment. The `.server.ts` suffix makes TanStack Start refuse
// to bundle this file into client code, so secrets (DATABASE_URL, and later
// storage keys and auth secrets) can live here.
import { z } from "zod"
import { CURRENCIES, isCurrency, type Currency } from "@/lib/plans"

export const R2_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    /** Public origin of this deployment, used for absolute URLs (OG images, share links). */
    APP_ORIGIN: z.url().default("http://localhost:3000"),
    /** Sent in the Nominatim User-Agent header (their usage policy requires a contact). */
    GEOCODE_CONTACT_EMAIL: z.email().optional(),
    /**
     * Postgres connection string. On Neon use the pooled URL (host contains
     * "-pooler") with sslmode=require. Optional so pages that never touch the
     * database still boot; `getDb()` throws a clear error when it is missing.
     */
    DATABASE_URL: z
      .url({
        protocol: /^postgres(ql)?$/,
        error: "DATABASE_URL must be a postgres:// or postgresql:// URL",
      })
      .optional(),
    /**
     * Where uploads go. `binding`: Cloudflare R2 through the Worker's BUCKET
     * binding (Workers deployments; STORAGE_SIGNING_SECRET required in
     * production, R2_PUBLIC_URL optional). `r2`: R2 over its S3 API (all
     * R2_* required; Node or other hosts). `local`: .storage/ on this machine
     * (development only). Unset: R2 when fully configured, else the binding
     * when bound, else local in development.
     */
    STORAGE_DRIVER: z.enum(["local", "r2", "binding"]).optional(),
    /** Cloudflare R2. Set all five, or none (see docs/STORAGE.md). */
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    /** Public base URL of the bucket: an r2.dev URL or a custom domain. */
    R2_PUBLIC_URL: z.url({ protocol: /^https?$/ }).optional(),
    /**
     * HMAC secret for signed upload URLs of the `local` and `binding` drivers.
     * Required in production with `binding`; generate with
     * `openssl rand -base64 32`.
     */
    STORAGE_SIGNING_SECRET: z.string().min(16).optional(),
    /** Geocoder (rule 11): nominatim (default, keyless) | google | mapbox | radar */
    GEOCODE_PROVIDER: z
      .enum(["nominatim", "google", "mapbox", "radar"])
      .default("nominatim"),
    GOOGLE_GEOCODING_KEY: z.string().min(1).optional(),
    MAPBOX_GEOCODING_TOKEN: z.string().min(1).optional(),
    RADAR_SECRET_KEY: z.string().min(1).optional(),
    /**
     * Better Auth: signs session cookies and tokens. Required in production;
     * generate with `openssl rand -base64 32`. Development falls back to a
     * fixed, public value.
     */
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    /** Google sign-in (OAuth client, "Web application"). Set both or neither. */
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    /** Resend API key. Without it, development prints emails to the server log. */
    RESEND_API_KEY: z.string().min(1).optional(),
    /** Sender, e.g. "Alikeni <hello@yourdomain.com>" (domain verified in Resend). */
    EMAIL_FROM: z.string().min(3).optional(),
    /** Reply-To on every outgoing email: an inbox a person reads. Optional. */
    EMAIL_REPLY_TO: z.email().optional(),
    /**
     * When nobody is signed in, act as a fixed dev user instead of refusing.
     * Off unless set to "true"; for local demos and scripts, never a real
     * deployment.
     */
    /**
     * Salt for hashing guest IPs and user agents (rate limits, view dedupe).
     * Optional: falls back to BETTER_AUTH_SECRET, then a fixed development
     * value. Rotating it resets dedupe and rate-limit identities.
     */
    ANALYTICS_SALT: z.string().min(16).optional(),
    /**
     * Cloudflare Turnstile secret. When set, guest RSVPs and wishes must carry
     * a valid token (pair with VITE_TURNSTILE_SITE_KEY). Unset: skipped.
     */
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    /**
     * Paystack secret key (sk_test_… or sk_live_…) for Premium upgrades.
     * Unset: the upgrade page says payments are not available. Also signs
     * webhooks; set the webhook URL to <APP_ORIGIN>/api/payments/paystack.
     */
    PAYSTACK_SECRET_KEY: z
      .string()
      .regex(/^sk_(test|live)_\w+$/, "must start with sk_test_ or sk_live_")
      .optional(),
    /**
     * Currencies the Paystack account can charge, comma-separated (KES, USD).
     * The upgrade page offers only these. Default KES: Kenyan accounts take
     * USD only once Paystack enables it, and a currency the account cannot
     * take fails at checkout.
     */
    PAYSTACK_CURRENCIES: z
      .string()
      .default("KES")
      .transform((value, ctx): Array<Currency> => {
        const list = value
          .split(",")
          .map((item) => item.trim().toUpperCase())
          .filter(Boolean)
        const unknown = list.filter((item) => !isCurrency(item))
        if (list.length === 0 || unknown.length > 0) {
          ctx.addIssue({
            code: "custom",
            message: `expected a comma-separated list of ${CURRENCIES.join(", ")}`,
          })
          return z.NEVER
        }
        return [...new Set(list.filter(isCurrency))]
      }),
    ALLOW_DEV_USER: z
      .enum(["true", "false", "1", "0"])
      .optional()
      .transform((value) => value === "true" || value === "1"),
  })
  .superRefine((env, ctx) => {
    // Storage must be unambiguous: fail at startup, naming what is missing.
    // With the binding, only R2_PUBLIC_URL matters; the S3 keys are unused.
    const missing = R2_KEYS.filter((key) => !env[key])
    const partial = missing.length > 0 && missing.length < R2_KEYS.length
    if (
      env.STORAGE_DRIVER === "r2" ||
      (partial && env.STORAGE_DRIVER !== "binding")
    ) {
      for (const key of missing) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message:
            env.STORAGE_DRIVER === "r2"
              ? "required when STORAGE_DRIVER=r2"
              : "R2 is partly configured; set all five R2_* variables or none",
        })
      }
    }
    if (!!env.GOOGLE_CLIENT_ID !== !!env.GOOGLE_CLIENT_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: [
          env.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID",
        ],
        message:
          "set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither",
      })
    }
    if (env.NODE_ENV === "production") {
      for (const key of [
        "BETTER_AUTH_SECRET",
        "RESEND_API_KEY",
        "EMAIL_FROM",
      ] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "required in production",
          })
        }
      }
    }
    if (
      env.NODE_ENV === "production" &&
      !env.ANALYTICS_SALT &&
      !env.BETTER_AUTH_SECRET
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["ANALYTICS_SALT"],
        message: "required in production (or set BETTER_AUTH_SECRET)",
      })
    }
    if (env.STORAGE_DRIVER === "local" && env.NODE_ENV === "production") {
      ctx.addIssue({
        code: "custom",
        path: ["STORAGE_DRIVER"],
        message:
          "local storage is for development only; use binding (Workers) or r2 in production",
      })
    }
    if (
      env.STORAGE_DRIVER === "binding" &&
      env.NODE_ENV === "production" &&
      !env.STORAGE_SIGNING_SECRET
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["STORAGE_SIGNING_SECRET"],
        message: "required in production with STORAGE_DRIVER=binding",
      })
    }
  })

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(
  source: Record<string, string | undefined>
): ServerEnv {
  // `KEY=` lines in .env arrive as "", which should mean "not set".
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== "")
  )
  const result = serverEnvSchema.safeParse(cleaned)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid server environment:\n${issues}`)
  }
  return result.data
}

// Read once at module load. On Cloudflare Workers, vars and secrets are in
// process.env from the start (nodejs_compat + compatibility_date ≥
// 2025-04-01 turns on nodejs_compat_populate_process_env).
export const serverEnv: ServerEnv = parseServerEnv(process.env)
