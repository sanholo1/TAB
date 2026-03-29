import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";
import { verifyAuthToken } from "../lib/jwt.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new HttpError(401, "Authorization header is required");
    }

    const [scheme, token] = authorizationHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Authorization header format must be Bearer <token>");
    }

    req.authUser = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
