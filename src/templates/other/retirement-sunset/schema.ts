import { InvitationConfigBase } from "../../_shared/schema"

/** Retirement Sunset uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type RetirementSunsetConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
