import { InvitationConfigBase } from "../../_shared/schema"

/** Botanical Sage uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type BotanicalSageConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
