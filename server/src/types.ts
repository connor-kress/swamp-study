import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  grad_year: z.number(),
  role: z.enum(["admin", "member"]),
  created_at: z.date(),
});

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  grad_year: z.number(),
  role: z.enum(["admin", "member"]).optional(),
});

export const UserSessionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  access_token_hash: z.string(),
  refresh_token_hash: z.string(),
  access_expires: z.date(),
  refresh_expires: z.date(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
