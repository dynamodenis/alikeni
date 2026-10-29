import { InvitationConfigBase } from "../../_shared/schema"

/** Christmas Dinner uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type ChristmasDinnerConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
