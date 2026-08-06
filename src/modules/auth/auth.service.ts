import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { generateOtp, hashOtp } from "@/utils/generateOtp";
import { sendOtpEmail } from "@/utils/mailer";
import {
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
  ResendOtpInput,
  UpdateProfileInput,
} from "./auth.validation";

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 1;
const MAX_OTP_ATTEMPTS = 5;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new AppError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const isEmailVerified = !env.ENABLE_EMAIL_VERIFICATION;

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        accountType: input.accountType,
        isEmailVerified,
      },
    });

    if (env.ENABLE_EMAIL_VERIFICATION) {
      await this.generateAndSendOtp(user.id, user.email, user.name);
      return { requiresVerification: true, user: this.toSafeUser(user) };
    }

    const tokens = await this.issueTokens(user.id, user.role, user.accountType);
    return {
      requiresVerification: false,
      user: this.toSafeUser(user),
      ...tokens,
    };
  },

  async generateAndSendOtp(userId: string, email: string, name: string) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.emailVerificationToken.create({
      data: { userId, otpHash: hashOtp(otp), expiresAt },
    });

    await sendOtpEmail({ to: email, name, otp });
  },

  async verifyOtp(input: VerifyOtpInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) throw new AppError("User not found", 404);
    if (user.isEmailVerified) throw new AppError("Email already verified", 400);

    const record = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!record)
      throw new AppError("No OTP found, please request a new one", 400);
    if (record.expiresAt < new Date()) throw new AppError("OTP expired", 400);
    if (record.attempts >= MAX_OTP_ATTEMPTS)
      throw new AppError("Too many attempts, request a new OTP", 429);

    if (record.otpHash !== hashOtp(input.otp)) {
      await prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError("Invalid OTP", 400);
    }

    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    const tokens = await this.issueTokens(
      updatedUser.id,
      updatedUser.role,
      updatedUser.accountType,
    );
    return { user: this.toSafeUser(updatedUser), ...tokens };
  },

  async resendOtp(input: ResendOtpInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user) throw new AppError("User not found", 404);
    if (user.isEmailVerified) throw new AppError("Email already verified", 400);

    await this.generateAndSendOtp(user.id, user.email, user.name);
    return { message: "OTP sent" };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || !user.passwordHash)
      throw new AppError("Invalid email or password", 401);

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    if (!user.isEmailVerified) {
      throw new AppError("Please verify your email before logging in", 403);
    }

    const tokens = await this.issueTokens(user.id, user.role, user.accountType);
    return { user: this.toSafeUser(user), ...tokens };
  },

  async refresh(oldRefreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const tokenHash = hashToken(oldRefreshToken);
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: decoded.userId, tokenHash, revoked: false },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(
        "Refresh token not recognized, please login again",
        401,
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new AppError("User not found", 404);

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = await this.issueTokens(user.id, user.role, user.accountType);
    return { user: this.toSafeUser(user), ...tokens };
  },

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  },

  async issueTokens(
    userId: string,
    role: "user" | "super_admin",
    accountType: "personal" | "organization",
  ) {
    const accessToken = signAccessToken({ userId, role, accountType });
    const refreshToken = signRefreshToken(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.JWT_REFRESH_EXPIRES_IN_DAYS);

    await prisma.refreshToken.create({
      data: { userId, tokenHash: hashToken(refreshToken), expiresAt },
    });

    return { accessToken, refreshToken };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return this.toSafeUser(user);
  },

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return this.toSafeUser(user);
  },

  toSafeUser(user: {
    id: string;
    name: string;
    email: string;
    accountType: string;
    role: string;
    languagePref: string;
    hasSeenOnboarding: boolean;
    isEmailVerified: boolean;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      role: user.role,
      languagePref: user.languagePref,
      hasSeenOnboarding: user.hasSeenOnboarding,
      isEmailVerified: user.isEmailVerified,
    };
  },
};
