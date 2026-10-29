import { InvitationConfigBase } from "../../_shared/schema"

/** Teddy Picnic uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type TeddyPicnicConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
