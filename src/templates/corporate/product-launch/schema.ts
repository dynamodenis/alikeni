import { InvitationConfigBase } from "../../_shared/schema"

/** Product Launch uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type ProductLaunchConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
