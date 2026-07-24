import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

function getEnvArray(key: string, fallback?: string): string[] {
  const value = getEnv(key, fallback);
  return value.split(",").map((v) => v.trim());
}

export const config = {
  app: {
    NODE_ENV: getEnv("NODE_ENV", "development"),
    PORT: Number(getEnv("PORT", "3000")),
  },
  database: {
    URL: getEnv("DATABASE_URL"),
  },
  cors: {
    ALLOWED_ORIGINS: getEnvArray("ALLOWED_ORIGINS", "http://localhost:3000"),
  },
  jwt: {
    ACCESS_TOKEN_SECRET: getEnv("ACCESS_TOKEN_SECRET"),
    ACCESS_TOKEN_EXPIRES_IN: getEnv("ACCESS_TOKEN_EXPIRES_IN"),
    REFRESH_TOKEN_SECRET: getEnv("REFRESH_TOKEN_SECRET"),
    REFRESH_TOKEN_EXPIRES_IN: getEnv("REFRESH_TOKEN_EXPIRES_IN"),
  },
  password: {
    RESET_PASSWORD_LINK: getEnv("RESET_PASSWORD_LINK"),
    RESET_PASSWORD_TOKEN_SECRET: getEnv("RESET_PASSWORD_TOKEN_SECRET"),
    RESET_PASSWORD_EXPIRES_IN: getEnv("RESET_PASSWORD_EXPIRES_IN"),
  },
  emailSender: {
    SMTP_USER: getEnv("SMTP_USER"),
    SMTP_PASSWORD: getEnv("SMTP_PASSWORD"),
    SMTP_HOST: getEnv("SMTP_HOST"),
    SMTP_PORT: getEnv("SMTP_PORT"),
    EMAIL_FROM: getEnv("EMAIL_FROM"),
    EMAIL_FROM_NAME: getEnv("EMAIL_FROM_NAME"),
  },
  cloudinary: {
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  },
};
