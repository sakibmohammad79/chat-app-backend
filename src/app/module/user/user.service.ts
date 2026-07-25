import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { userSelect } from "../../types";
import { ApiError } from "../../error/ApiError";

export const getMyProfileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) throw new ApiError(404, "User not found");

  return user;
};

export const getUserByIdService = async (targetId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: userSelect,
  });

  if (!user) throw new ApiError(404, "User not found");

  return user;
};

export const userService = {
  getMyProfileService,
  getUserByIdService,
};
