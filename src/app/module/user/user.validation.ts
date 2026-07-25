import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(30, "Name must be at most 30 characters")
      .optional(),
    bio: z
      .string()
      .max(160, "Bio must be at most 160 characters")
      .trim()
      .optional(),
  }),
});

export const searchUserSchema = z.object({
  query: z.object({
    q: z
      .string({ error: "Search query is required" })
      .min(1, "Search query cannot be empty")
      .trim(),

    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(20).default(10),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid user ID"),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
export type SearchUserQuery = z.infer<typeof searchUserSchema>["query"];
