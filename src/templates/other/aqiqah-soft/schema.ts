import { InvitationConfigBase } from "../../_shared/schema"

/** Aqiqah Soft uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type AqiqahSoftConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
