import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Vinyl Love Song adds the years together; they print on the record label. */
export const schema = InvitationConfigBase.extend({
  years: z.int().min(1).max(100),
})
export type VinylLoveSongConfig = z.infer<typeof schema>
