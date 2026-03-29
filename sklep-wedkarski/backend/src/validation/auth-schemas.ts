import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9._-]+$/;
const namePattern = /^[\p{L}\s'-]+$/u;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(usernamePattern),
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(namePattern),
    lastName: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(namePattern),
    email: z.string().trim().email().max(191),
    password: z.string().min(8).max(72).regex(passwordPattern),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email().max(191),
  password: z.string().min(1),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
