import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Golden Years adds the years together; they are pressed into the seal crest. */
export const schema = InvitationConfigBase.extend({
  years: z.int().min(1).max(100),
})
export type GoldenYearsConfig = z.infer<typeof schema>
