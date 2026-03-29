import type { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/http-error.js";

const hasPrismaCode = (error: unknown, code: string): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (hasPrismaCode(error, "P2002")) {
    res.status(409).json({
      message: "Resource already exists",
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
};
