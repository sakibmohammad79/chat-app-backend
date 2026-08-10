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

export const getMessagesSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid conversation ID"),
  }),
  query: z.object({
    //cursor = last fetched message id, get cursor id's before messages
    cursor: z.uuid().optional(),
    limit: z.coerce.number().int().positive().max(50).default(30),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
export type getMessageQuery = z.infer<typeof getMessagesSchema>["query"];
