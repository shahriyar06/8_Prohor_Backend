import crypto from "crypto";

export const generateOtp = (): string => {
    const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
};

export function hashOtp(otp: string): string {
  const hash = crypto.createHash("sha256").update(otp).digest("hex");
  return hash;
}