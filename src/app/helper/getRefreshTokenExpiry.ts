import { config } from "../config";

// Refresh token expiry calculate — "7d" → Date object
export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(config.jwt.refresh_token_expires_in);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};
