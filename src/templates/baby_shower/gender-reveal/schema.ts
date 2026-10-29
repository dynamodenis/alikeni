import { InvitationConfigBase } from "../../_shared/schema"

/** Gender Reveal uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type GenderRevealConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
