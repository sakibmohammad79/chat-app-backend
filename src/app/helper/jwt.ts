import { config } from "../config";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.access_token_secret, {
    expiresIn: config.jwt
      .access_token_secret_expires_in as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refresh_token_secret, {
    expiresIn: config.jwt
      .refresh_token_secret_expires_in as jwt.SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.access_token_secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refresh_token_secret) as TokenPayload;
};
