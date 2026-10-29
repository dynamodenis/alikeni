import { InvitationConfigBase } from "../../_shared/schema"

/** Black Tie Gala uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type BlackTieGalaConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
