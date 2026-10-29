import { InvitationConfigBase } from "../../_shared/schema"

/** Eid Open House uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type EidOpenHouseConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
