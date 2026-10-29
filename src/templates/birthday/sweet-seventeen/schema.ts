import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Sweet Seventeen adds the age being celebrated; it is shown in the hero pill. */
export const schema = InvitationConfigBase.extend({
  age: z.int().min(1).max(150),
})
export type SweetSeventeenConfig = z.infer<typeof schema>
