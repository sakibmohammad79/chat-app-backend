import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    targetUserId: z
      .string({ error: "Target user ID is required" })
      .cuid("Invalid user ID"),
  }),
});

export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>["body"];
