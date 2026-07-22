import { prisma } from "../../../lib/prisma";
import { ApiError } from "../../error/ApiError";
import { getRefreshTokenExpiry } from "../../helper/getRefreshTokenExpiry";
import { excludePassword } from "../../types";
import { comparePassword, hashPassword } from "../../utils/hashPassword";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import type { LoginInput, RegisterInput } from "./auth.validation";

const registerService = async (data: RegisterInput) => {
  console.log(data, "data");
  const { name, email, password } = data;

  // Email already exists check
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }
  const hashedPassword = await hashPassword(password);

  const result = await prisma.$transaction(async (tx) => {
    // user create
    const user = await tx.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // Token generate
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    // Refresh token save to db
    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });
    return {
      user,
      accessToken,
      refreshToken,
    };
  });

  return {
    user: excludePassword(result.user),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
};

const loginService = async (data: LoginInput) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const result = await prisma.$transaction(async (tx) => {
    //user only mark
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { isOnline: true },
    });

    //generate token
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    //store refresh token
    await tx.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      updatedUser,
      accessToken,
      refreshToken,
    };
  });

  return {
    user: excludePassword(result.updatedUser),
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
};

export const authService = {
  registerService,
  loginService,
};
