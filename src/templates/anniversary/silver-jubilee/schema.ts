import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Silver Jubilee adds the years together; they sit in the hero badge. */
export const schema = InvitationConfigBase.extend({
  years: z.int().min(1).max(100),
})
export type SilverJubileeConfig = z.infer<typeof schema>
