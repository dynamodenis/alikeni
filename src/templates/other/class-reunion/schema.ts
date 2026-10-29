import { InvitationConfigBase } from "../../_shared/schema"

/** Class Reunion uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type ClassReunionConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
