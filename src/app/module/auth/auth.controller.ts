import type { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/apiRespnse";
import { config } from "../../config";
import { ApiError } from "../../error/ApiError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.app.NODE_ENV === "production",
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.loginService(req.body);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendResponse(res, {
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new ApiError(401, "Refresh token missing");
    }

    const result = await authService.refreshTokenService(token);

    // Notun refresh token cookie te set
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendResponse(res, {
      message: "Token refreshed",
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    const userId = req.user!.id; // authenticate middleware guaranteed

    if (token) {
      await authService.logoutService(userId, token);
    }

    // Cookie clear
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    sendResponse(res, { message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const authController = {
  register,
  login,
  refreshToken,
  logout,
};
