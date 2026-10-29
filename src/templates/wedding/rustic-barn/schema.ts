import { InvitationConfigBase } from "../../_shared/schema"

/** Rustic Barn uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type RusticBarnConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
