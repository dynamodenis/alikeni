import { InvitationConfigBase } from "../../_shared/schema"

/** Webinar Minimal uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type WebinarMinimalConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
