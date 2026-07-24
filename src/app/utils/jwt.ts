import { config } from "../config";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const expiresIn: any = config.jwt.ACCESS_TOKEN_EXPIRES_IN;

  return jwt.sign(payload, config.jwt.ACCESS_TOKEN_SECRET, {
    expiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const refreshExpiresIn: any = config.jwt.REFRESH_TOKEN_EXPIRES_IN;

  return jwt.sign(payload, config.jwt.REFRESH_TOKEN_SECRET, {
    expiresIn: refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.REFRESH_TOKEN_SECRET) as TokenPayload;
};
