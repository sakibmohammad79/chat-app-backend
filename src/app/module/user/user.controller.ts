import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/apiRespnse";
import { send } from "node:process";

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getMyProfileService(req.user!.id);
    sendResponse(res, { data: user });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getUserByIdService(req.params.id as string);
    sendResponse(res, { data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await userService.updateProfileService(
      req.user!.id,
      req.body,
    );
    sendResponse(res, {
      message: "Profiled updated",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const updateAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }
    const avatarUrl = req.file.path;
    const updated = await userService.updateAvatarService(
      req.user!.id,
      avatarUrl,
    );
    sendResponse(res, { message: "Avatar updated", data: updated });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.searchUserService(req.user!.id, {
      q: req.query.q as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    });

    sendResponse(res, {
      data: result.users,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const userController = {
  getMyProfile,
  getUserById,
  updateProfile,
  updateAvatar,
};
