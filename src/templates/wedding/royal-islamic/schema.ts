import { InvitationConfigBase } from "../../_shared/schema"

/** Royal Islamic uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type RoyalIslamicConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
