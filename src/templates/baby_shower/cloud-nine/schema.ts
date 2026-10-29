import { InvitationConfigBase } from "../../_shared/schema"

/** Cloud Nine uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type CloudNineConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
