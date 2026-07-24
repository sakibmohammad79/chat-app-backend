import { config } from "../config";

// Refresh token expiry calculate — "7d" → Date object
export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(config.jwt.REFRESH_TOKEN_EXPIRES_IN);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
