import { z } from "zod";

export const DateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) {
    return new Date(arg);
  }
}, z.date());

export const TimeSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    // "HH:MM" or "HH:MM:SS"
    const [h, m, s = "00"] = val.split(":");
    const date = new Date(Date.UTC(1970, 0, 1, Number(h), Number(m), Number(s)));
    return isNaN(date.getTime()) ? undefined : date;
  }
  if (val instanceof Date) {
    return val;
  }
  return undefined;
}, z.date());

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  grad_year: z.number(),
  role: z.enum(["admin", "member"]),
  created_at: DateSchema,
});

export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().min(1).max(100),
  grad_year: z.number().int().positive(),
  role: z.enum(["admin", "member"]),
});

export const UserSessionSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  access_token: z.string().min(1).max(255),
  refresh_token: z.string().min(1).max(255),
  access_expires: DateSchema,
  refresh_expires: DateSchema,
  created_at: DateSchema,
  updated_at: DateSchema,
});

export const CourseSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(7).max(10), // e.g. "CEN3031"
  name: z .string().min(1).max(100),
  description: z.string().min(1),
  created_at: DateSchema,
});

export const CourseTermEnum = z.enum([
  "fall",
  "spring",
  "summer-a",
  "summer-b",
  "summer-c",
]);

export const UserGroupRoleEnum = z.enum(["owner", "member"]);

export const WeekdayEnum = z.enum([
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
]);

export const GroupSchema = z.object({
  id: z.number().int().positive(),
  course_id: z.number().int().positive(),
  year: z.number().int(),
  term: CourseTermEnum,
  contact_details: z.string().min(1),
  meeting_day: WeekdayEnum.nullable(),
  meeting_time: TimeSchema.nullable(),
  created_at: DateSchema,
});

export const UserGroupSchema = z.object({
  user_id: z.number().int().positive(),
  group_id: z.number().int().positive(),
  group_role: UserGroupRoleEnum,
  created_at: DateSchema,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
export type Course = z.infer<typeof CourseSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type UserGroup = z.infer<typeof UserGroupSchema>;

export type SessionWithUser = {
  user: User,
  session: UserSession,
};

export type TokenData = {
  accessToken: string,
  refreshToken: string,
  accessExpires: Date,
  refreshExpires: Date,
};

export const PendingVerificationSchema = z.object({
  email: z.string().email(),
  code_hash: z.string().min(1).max(255),
  expires_at: DateSchema,
  created_at: DateSchema,
});

export type PendingVerification = z.infer<typeof PendingVerificationSchema>;

export type NewPendingVerificationInput = {
  email: string;
  code_hash: string;
  expires_at: Date;
};
