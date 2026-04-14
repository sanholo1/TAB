import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";

export const authorize = (...roles: number[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      return next(new HttpError(401, "Unauthorized"));
    }

    if (!roles.includes(req.authUser.roleId)) {
      return next(new HttpError(403, "Forbidden — insufficient permissions"));
    }

    next();
  };
};
