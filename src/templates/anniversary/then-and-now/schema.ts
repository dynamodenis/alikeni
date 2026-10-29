import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Then and Now adds the years together; they set the "then" year. */
export const schema = InvitationConfigBase.extend({
  years: z.int().min(1).max(100),
})
export type ThenAndNowConfig = z.infer<typeof schema>
