import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { userSelect } from "../../types";
import { ApiError } from "../../error/ApiError";
import type { UpdateProfileInput } from "./user.validation";

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

const updateProfileService = async (
  userId: string,
  data: UpdateProfileInput,
) => {
  if (data.name === undefined && data.bio === undefined) {
    throw new ApiError(400, "Nothing to update");
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.bio !== undefined && { bio: data.bio || null }),
    },
    select: userSelect,
  });
  return updated;
};

export const userService = {
  getMyProfileService,
  getUserByIdService,
  updateProfileService,
};
