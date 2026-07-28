import type { Response } from "express";

interface ResponseOptions {
  statusCode?: number;
  message?: string;
  data?: unknown;
  meta?: unknown;
}

export const sendResponse = (
  res: Response,
  { statusCode = 200, message = "Success", data = null, meta }: ResponseOptions,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta as Record<string, unknown>),
  });
};
