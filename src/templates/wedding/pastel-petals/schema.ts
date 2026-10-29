import { InvitationConfigBase } from "../../_shared/schema"

/** Pastel Petals uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type PastelPetalsConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
