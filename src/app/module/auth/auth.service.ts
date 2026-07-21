import { register } from "node:module";
import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import { getRefreshTokenExpiry } from "../../helper/getRefreshTokenExpiry";
import { excludePassword } from "../../types";
import { hashPassword } from "../../utils/hashPassword";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import type { RegisterInput } from "./auth.validation";

const registerService = async (data: RegisterInput) => {
  const { name, email, password } = data;

  // Email already exists check
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Token generate
  const accessToken = generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

  // Refresh token DB te save — rotation er shomoy verify korte lagbe
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
};

export const authService = {
  registerService,
};
