import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters")
      .trim(),

    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format")
      .toLowerCase()
      .trim(),

    password: z
      .string({ message: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password too long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format").toLowerCase().trim(),

    password: z.string({ message: "Password is required" }),
  }),
});

// TypeScript type infer — service/controller e use hobe
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
