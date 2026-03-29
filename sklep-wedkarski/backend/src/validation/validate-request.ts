import type { ZodSchema } from "zod";
import { HttpError } from "../errors/http-error.js";

export const validateRequest = <T>(schema: ZodSchema<T>, payload: unknown): T => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    });

    throw new HttpError(400, "Validation failed", details);
  }

  return parsed.data;
};
