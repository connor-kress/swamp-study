import { z } from "zod";

export const DateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) {
    return new Date(arg);
  }
}, z.date());

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  grad_year: z.number(),
  role: z.enum(["admin", "member"]),
  created_at: DateSchema,
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
  access_token: z.string(),
  refresh_token: z.string(),
  access_expires: DateSchema,
  refresh_expires: DateSchema,
  created_at: DateSchema,
  updated_at: DateSchema,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

export type SessionWithUser = {
  user: User,
  session: UserSession,
};
