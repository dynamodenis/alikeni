import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Golden Milestone adds the age being celebrated; it sits inside the seal. */
export const schema = InvitationConfigBase.extend({
  age: z.int().min(1).max(150),
})
export type GoldenMilestoneConfig = z.infer<typeof schema>
