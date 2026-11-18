import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/**
 * Class Reunion adds the graduating year shown on the seal; the ribbon counts
 * the years from it to the event. The default keeps invitations saved before
 * the field existed looking as they did.
 */
export const schema = InvitationConfigBase.extend({
  classOf: z.int().min(1900).max(2200).default(2007),
})
export type ClassReunionConfig = z.infer<typeof schema>
