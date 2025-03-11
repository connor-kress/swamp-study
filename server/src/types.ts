import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  grad_year: z.number(),
  role: z.enum(["admin", "member"]),
  created_at: z.date(),
});

export type User = z.infer<typeof UserSchema>;
