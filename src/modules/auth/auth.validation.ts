import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    accountType: z.enum(["personal", "organization"]),
    organizationName: z.string().min(2).optional(),
  })
  .refine((d) => d.accountType === "personal" || !!d.organizationName, {
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
  profilePhoto: z.string().url().optional(),
  priorityColors: z
    .object({
      low: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
      medium: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
      high: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
    })
    .refine(
      (colors) => {
        const values = Object.values(colors);
        return new Set(values).size === values.length; // তিনটাই আলাদা হতে হবে
      },
      { message: "Each priority must have a unique color" },
    )
    .optional(),
});

export const updateLanguageSchema = z.object({
  languagePref: z.enum(["en", "bn"]),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
