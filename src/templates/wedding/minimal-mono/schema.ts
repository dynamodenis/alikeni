import { InvitationConfigBase } from "../../_shared/schema"

/** Minimal Mono uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type MinimalMonoConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
