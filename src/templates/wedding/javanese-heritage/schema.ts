import { InvitationConfigBase } from "../../_shared/schema"

/** Javanese Heritage uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type JavaneseHeritageConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
