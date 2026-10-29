import { InvitationConfigBase } from "../../_shared/schema"

/** Little Safari uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type LittleSafariConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
