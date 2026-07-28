import type { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { userSelect } from "../../types";
import { ApiError } from "../../error/ApiError";
import type { SearchUserQuery, UpdateProfileInput } from "./user.validation";
import cloudinary from "../../config/cloudinary";
import { buildPaginationMeta, getPagination } from "../../utils/pagination";

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

const updateAvatarService = async (userId: string, avatarUrl: string) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });
  if (currentUser?.avatar) {
    const urlParts = currentUser.avatar.split("/");
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = `chat-app/avatars/${fileWithExt?.split(".")[0]}`;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      console.warn("Failed to delete old avatar from cloudinary", publicId);
    }
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: userSelect,
  });
  return updated;
};

const searchUserService = async (
  currentUserId: string,
  query: SearchUserQuery,
) => {
  const { q, page, limit } = query;
  const { skip, take } = getPagination({ page, limit });
  const where = {
    AND: [
      { id: { not: currentUserId } },
      {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
        ],
      },
    ],
  };
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userSelect,
      skip,
      take,
      orderBy: { name: "asc" },
    }),
  ]);
  return {
    users,
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const userService = {
  getMyProfileService,
  getUserByIdService,
  updateProfileService,
  updateAvatarService,
  searchUserService,
};
