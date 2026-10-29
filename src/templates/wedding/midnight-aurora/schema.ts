import { InvitationConfigBase } from "../../_shared/schema"

/** Midnight Aurora uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type MidnightAuroraConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
