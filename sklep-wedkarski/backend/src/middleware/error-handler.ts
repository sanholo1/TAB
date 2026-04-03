import type { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
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

  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        message: "Image file is too large",
      });
      return;
    }

    res.status(400).json({
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error",
  });
};
