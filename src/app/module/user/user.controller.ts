import type { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/apiRespnse";

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

export const userController = {
  getMyProfile,
  getUserById,
  updateProfile,
};
