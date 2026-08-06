import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  accountType: z.enum(["personal", "organization"]),
  organizationName: z.string().min(2).optional(),
}).refine((d) => d.accountType === "personal" || !!d.organizationName, {
  message: "organizationName is required for organization account",
  path: ["organizationName"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  languagePref: z.enum(["bn", "en"]).optional(),
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;