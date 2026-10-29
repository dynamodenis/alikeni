import { InvitationConfigBase } from "../../_shared/schema"

/** Housewarming Keys uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type HousewarmingKeysConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
