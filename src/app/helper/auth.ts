import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../error/ApiError";
import { verifyAccessToken } from "./jwt";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token missing");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Access token missing");
    }
    const decoded = verifyAccessToken(token);

    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    next(new ApiError(401, "Invalid or expired access token"));
  }
};
