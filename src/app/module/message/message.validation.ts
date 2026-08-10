import { Param } from "@prisma/client/runtime/client";
import { emoji, z } from "zod";

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

export const editMessageSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid message ID"),
  }),
  body: z.object({
    content: z
      .string({ error: "Content is required" })
      .min(1, "Message can not be empty")
      .max(2000, "Message too long")
      .trim(),
  }),
});

// delete/reaction

export const messageIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid message ID"),
  }),
});

export const addReactionSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid message ID"),
  }),
  body: z.object({
    emoji: z.string({ error: "Emoji is required" }).min(1).max(10),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>["body"];
export type getMessageQuery = z.infer<typeof getMessagesSchema>["query"];
export type EditMessageInput = z.infer<typeof editMessageSchema>["body"]
