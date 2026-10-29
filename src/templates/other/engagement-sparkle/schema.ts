import { InvitationConfigBase } from "../../_shared/schema"

/** Engagement Sparkle uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type EngagementSparkleConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
