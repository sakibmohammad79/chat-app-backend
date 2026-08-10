import { z } from "zod";

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid conversation ID"),
  }),
  body: z.object({
    content: z
      .string({ error: "Message content is required" })
      .min(1, "Message cannot be empty")
      .max(2000, "Message too long (max 2000 characters")
      .trim(),
    type: z.enum(["TEXT", "IMAGE", "FILE"]).default("TEXT"),
    replyToId: z.uuid("Invalid message ID").optional(),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
