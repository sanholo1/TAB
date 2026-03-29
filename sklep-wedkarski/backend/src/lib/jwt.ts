import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../errors/http-error.js";
import type { AuthTokenPayload } from "../types/auth.js";

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<jwt.SignOptions["expiresIn"]>,
  });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded !== "object" || decoded === null) {
      throw new HttpError(401, "Invalid token");
    }

    const userId = decoded.userId;
    const roleId = decoded.roleId;

    if (typeof userId !== "number" || typeof roleId !== "number") {
      throw new HttpError(401, "Invalid token payload");
    }

    return { userId, roleId };
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
};
