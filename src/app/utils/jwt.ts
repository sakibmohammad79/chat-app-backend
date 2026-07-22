import { config } from "../config";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const expiresIn: any = config.jwt.access_token_expires_in;

  return jwt.sign(payload, config.jwt.access_token_secret, {
    expiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const refreshExpiresIn: any = config.jwt.refresh_token_expires_in;

  return jwt.sign(payload, config.jwt.refresh_token_secret, {
    expiresIn: refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.access_token_secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refresh_token_secret) as TokenPayload;
};
