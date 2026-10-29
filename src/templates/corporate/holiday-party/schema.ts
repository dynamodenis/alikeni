import { InvitationConfigBase } from "../../_shared/schema"

/** Holiday Party uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type HolidayPartyConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
