import { InvitationConfigBase } from "../../_shared/schema"

/** Bridal Shower Blush uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type BridalShowerBlushConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
