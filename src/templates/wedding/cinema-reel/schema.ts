import { InvitationConfigBase } from "../../_shared/schema"

/** Cinema Reel uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type CinemaReelConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
