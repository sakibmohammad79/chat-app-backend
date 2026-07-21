import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/apiRespnse";
import { config } from "../../config";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.app.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days ms
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerService(req.body);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendResponse(res, {
      statusCode: 200,
      message: "User registered successfully!",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const authController = {
  register,
};
