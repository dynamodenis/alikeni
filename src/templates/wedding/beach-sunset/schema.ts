import { InvitationConfigBase } from "../../_shared/schema"

/** Beach Sunset uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type BeachSunsetConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
