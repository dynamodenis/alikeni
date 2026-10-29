import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Love Letter adds the years together; they are counted inside the letter. */
export const schema = InvitationConfigBase.extend({
  years: z.int().min(1).max(100),
})
export type LoveLetterConfig = z.infer<typeof schema>
