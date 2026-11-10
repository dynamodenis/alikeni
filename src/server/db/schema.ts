// Drizzle schema (Postgres on Neon). jsonb columns are typed with the same Zod
// output types that templates render, so DB rows and components cannot drift.
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import type { InvitationConfigBase } from "../../templates/_shared/schema"
import { TEMPLATE_CATEGORIES } from "../../templates/types"

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

/* ---------- enums ---------- */

export const invitationStatus = pgEnum("invitation_status", [
  "draft",
  "published",
  "archived",
])
export const mediaKind = pgEnum("media_kind", ["image", "audio"])
/** Free: limited (see `src/lib/plans.ts`). Premium: paid once per invitation. */
export const invitationPlan = pgEnum("invitation_plan", ["free", "premium"])
export const orderStatus = pgEnum("order_status", ["pending", "paid", "failed"])
export const rsvpAttending = pgEnum("rsvp_attending", ["yes", "no", "maybe"])
export const templateCategory = pgEnum("template_category", TEMPLATE_CATEGORIES)

/* ---------- auth (Better Auth; usePlural maps user → users etc.) ---------- */

export const users = pgTable("users", {
  // Text ids: Better Auth issues string ids.
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  // Better Auth always sets it; nullable so pre-auth rows stay valid.
  name: text("name"),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
)

/** One row per sign-in method: "credential" (password hash) or "google". */
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_idx").on(t.userId)]
)

/** Short-lived tokens: email verification, password reset. */
export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)]
)

/* ---------- templates ---------- */

export const templatesMeta = pgTable("templates_meta", {
  /** "<category>/<slug>", matches TemplateMeta.id and the code registry. */
  id: text("id").primaryKey(),
  category: templateCategory("category").notNull(),
  name: text("name").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
})

/* ---------- invitations ---------- */

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => templatesMeta.id),
    /** Null until first publish; unique once set. */
    slug: text("slug").unique(),
    status: invitationStatus("status").notNull().default("draft"),
    /** Set to premium only by a verified payment (`src/server/payments`). */
    plan: invitationPlan("plan").notNull().default("free"),
    draftConfig: jsonb("draft_config").$type<InvitationConfigBase>().notNull(),
    publishedConfig: jsonb("published_config").$type<InvitationConfigBase>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("invitations_owner_idx").on(t.ownerId),
    check(
      "invitations_slug_format",
      sql`${t.slug} IS NULL OR ${t.slug} ~ '^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$'`
    ),
    check(
      "invitations_published_has_config",
      sql`${t.status} <> 'published' OR (${t.publishedConfig} IS NOT NULL AND ${t.slug} IS NOT NULL)`
    ),
  ]
)

/* ---------- media ---------- */

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitationId: uuid("invitation_id").references(() => invitations.id, {
      onDelete: "set null",
    }),
    kind: mediaKind("kind").notNull(),
    key: text("key").notNull().unique(),
    mime: text("mime").notNull(),
    bytes: integer("bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSec: real("duration_sec"),
    createdAt: createdAt(),
  },
  (t) => [
    index("media_assets_owner_idx").on(t.ownerId),
    index("media_assets_invitation_idx").on(t.invitationId),
    check("media_assets_bytes_positive", sql`${t.bytes} > 0`),
  ]
)

/* ---------- guest responses ---------- */

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestName: text("guest_name").notNull(),
    attending: rsvpAttending("attending").notNull(),
    partySize: integer("party_size").notNull().default(1),
    message: text("message"),
    contact: text("contact"),
    createdAt: createdAt(),
    /** Salted hashes only; raw IPs and user agents are never stored. */
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash").notNull(),
    /** When the owner's "new RSVPs" email covered this row (null: pending). */
    ownerNotifiedAt: timestamp("owner_notified_at", { withTimezone: true }),
    /** When this guest got the event reminder (null: not sent). */
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
  },
  (t) => [
    index("rsvps_invitation_idx").on(t.invitationId, t.createdAt),
    // The notification job scans only rows still waiting for an email.
    index("rsvps_owner_pending_idx")
      .on(t.createdAt)
      .where(sql`${t.ownerNotifiedAt} IS NULL`),
    check("rsvps_party_size_range", sql`${t.partySize} BETWEEN 0 AND 20`),
  ]
)

export const wishes = pgTable(
  "wishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    message: text("message").notNull(),
    /** Visible by default; owners hide unwanted wishes from the dashboard. */
    approved: boolean("approved").notNull().default(true),
    createdAt: createdAt(),
    ipHash: text("ip_hash").notNull(),
  },
  (t) => [index("wishes_invitation_idx").on(t.invitationId, t.createdAt)]
)

/* ---------- analytics ---------- */

export const pageViews = pgTable(
  "page_views",
  {
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.invitationId, t.day] })]
)

/**
 * Visitors already counted in `page_views`, one row per invitation, UTC day
 * and visitor (sha256 of the salted IP + user-agent hashes). Shared by every
 * server instance, so a returning guest counts once per day anywhere. Rows
 * older than a couple of days are pruned opportunistically.
 */
export const pageViewVisitors = pgTable(
  "page_view_visitors",
  {
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    visitorHash: text("visitor_hash").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.invitationId, t.day, t.visitorHash] }),
    index("page_view_visitors_day_idx").on(t.day),
  ]
)

/* ---------- rate limiting ---------- */

/**
 * Accepted hits per rate-limit key (sliding-window log, see
 * src/server/rate-limit/postgres.ts). Keys hold hashed identities only
 * (salted IP hash, hashed device id).
 * Rows older than the longest window are pruned as hits arrive.
 */
export const rateLimitHits = pgTable(
  "rate_limit_hits",
  {
    key: text("key").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("rate_limit_hits_key_at_idx").on(t.key, t.at),
    index("rate_limit_hits_at_idx").on(t.at),
  ]
)

/* ---------- payments ---------- */

/**
 * One checkout attempt (Paystack). Created pending before redirecting to
 * Paystack; marked paid only after Paystack confirms (webhook or verify) with
 * the same amount and currency. Kept when the invitation or user is deleted
 * (accounting), hence `set null`.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Our reference, sent to Paystack and echoed back in every event. */
    reference: text("reference").notNull().unique(),
    invitationId: uuid("invitation_id").references(() => invitations.id, {
      onDelete: "set null",
    }),
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    provider: text("provider").notNull().default("paystack"),
    product: text("product").notNull().default("invitation_premium"),
    /** In the currency's subunit (cents), as Paystack counts it. */
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    status: orderStatus("status").notNull().default("pending"),
    /** Paystack's transaction id and channel (card, mobile_money, …). */
    providerTransactionId: text("provider_transaction_id"),
    channel: text("channel"),
    /** Why a payment was refused (amount or currency mismatch). */
    failureReason: text("failure_reason"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_invitation_idx").on(t.invitationId),
    index("orders_owner_idx").on(t.ownerId),
    check("orders_amount_positive", sql`${t.amount} > 0`),
  ]
)

/* ---------- geocoding ---------- */

export const geocodeCache = pgTable("geocode_cache", {
  /** sha256 of the normalized query string. */
  queryHash: text("query_hash").primaryKey(),
  query: text("query").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: createdAt(),
})

/* ---------- guest list ---------- */

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Unguessable token used in personal links (?to=<token>). */
    slugToken: text("slug_token").notNull().unique(),
    group: text("group"),
  },
  (t) => [index("guests_invitation_idx").on(t.invitationId)]
)

/* ---------- inferred row types ---------- */

export type User = typeof users.$inferSelect
export type TemplateMetaRow = typeof templatesMeta.$inferSelect
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type MediaAsset = typeof mediaAssets.$inferSelect
export type Rsvp = typeof rsvps.$inferSelect
export type Wish = typeof wishes.$inferSelect
export type Guest = typeof guests.$inferSelect
