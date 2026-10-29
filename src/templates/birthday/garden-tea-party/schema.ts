import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Garden Tea Party adds the age being celebrated; it is used in the copy and editor. */
export const schema = InvitationConfigBase.extend({
  age: z.int().min(1).max(150),
})
export type GardenTeaPartyConfig = z.infer<typeof schema>
