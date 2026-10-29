import { InvitationConfigBase } from "../../_shared/schema"

/** Conference Grid uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type ConferenceGridConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
