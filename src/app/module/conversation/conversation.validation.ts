import { Param } from "@prisma/client/runtime/client";
import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    targetUserId: z
      .string({ error: "Target user ID is required" })
      .cuid("Invalid user ID"),
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Group name is required" })
      .min(2, "Group must be at least 2 characters")
      .max(50, "Group name must be at most 50 characters")
      .trim(),
    memberIds: z
      .array(z.string().uuid("Invalid member ID"))
      .min(2, "Group must have at least 2 other members")
      .max(49, "Group can have at most 50 members"),
  }),
});

const updateGroupSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Group name must be at least 2 characters")
      .max(50, "Group name must be at most 50 characters")
      .trim()
      .optional(),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID"),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, "Group name must be at least 2 characters")
      .max(50, "group name must at most 50 characters")
      .trim()
      .optional(),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid conversation ID"),
    userId: z.string().uuid("Invalid user ID"),
  }),
});

export type CreateConversationInput = z.infer<
  typeof createConversationSchema
>["body"];
export type CreateGroupInput = z.infer<typeof createGroupSchema>["body"];
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>["body"];
export type AddMembersInput = z.infer<typeof addMemberSchema>["body"];
