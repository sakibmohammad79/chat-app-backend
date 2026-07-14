import type { NextFunction, Request, Response } from "express";

export const apiNotFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(404).json({
    success: false,
    message: `API not found: ${req.originalUrl}`,
  });
};
