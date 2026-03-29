import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9._-]+$/;
const namePattern = /^[\p{L}\s'-]+$/u;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const profileUpdateSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(usernamePattern)
      .optional(),
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(namePattern)
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(namePattern)
      .optional(),
    email: z.string().trim().email().max(191).optional(),
    currentPassword: z.string().min(1).optional(),
    newPassword: z.string().min(8).max(72).regex(passwordPattern).optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnyField =
      data.username !== undefined ||
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined ||
      data.newPassword !== undefined;

    if (!hasAnyField) {
      ctx.addIssue({
        code: "custom",
        message: "No profile fields provided",
        path: [],
      });
    }

    if (data.newPassword && !data.currentPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Current password is required to set a new password",
        path: ["currentPassword"],
      });
    }
  });

export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;
