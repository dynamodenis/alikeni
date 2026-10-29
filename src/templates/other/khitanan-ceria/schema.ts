import { InvitationConfigBase } from "../../_shared/schema"

/** Khitanan Ceria uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type KhitananCeriaConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
