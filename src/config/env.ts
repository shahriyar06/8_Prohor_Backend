import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: process.env.PORT || "5000",
  DATABASE_URL: required("DATABASE_URL"),
  JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN_DAYS: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 30),
  RESEND_API_KEY: required("RESEND_API_KEY"),
  EMAIL_FROM: process.env.EMAIL_FROM || "onboarding@resend.dev",
  ENABLE_EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === "true",
  NODE_ENV: process.env.NODE_ENV || "development",
};