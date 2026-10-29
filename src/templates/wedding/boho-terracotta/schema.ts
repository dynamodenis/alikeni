import { InvitationConfigBase } from "../../_shared/schema"

/** Boho Terracotta uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type BohoTerracottaConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
