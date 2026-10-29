import { InvitationConfigBase } from "../../_shared/schema"

/** Twinkle Star uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type TwinkleStarConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
