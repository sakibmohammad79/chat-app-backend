import { ZodError } from "zod";
import { ApiError } from "../error/ApiError";
import { config } from "../config";
import type { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Zod validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  // Handle custom application errors (expected errors)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Log unexpected errors for debugging
  console.error("Unexpected Error:", err);

  // Check whether the error is operational (expected) or not
  const isOperationalError = (err as any).isOperational || false;

  // In production, terminate the process for unexpected programming errors
  if (config.app.nodeEnv === "production" && !isOperationalError) {
    console.error("Critical programming error! Exiting process safely...");
    process.exit(1);
  }

  // Return a generic 500 response
  // Include stack trace only in development mode
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(config.app.nodeEnv === "development" && {
      stack: err.stack,
    }),
  });
};
