import { InvitationConfigBase } from "../../_shared/schema"

/** Team Offsite uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type TeamOffsiteConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
