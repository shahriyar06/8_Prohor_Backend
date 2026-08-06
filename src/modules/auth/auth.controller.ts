import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "@/utils/apiResponse";
import { AppError } from "@/utils/AppError";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    if (!result.requiresVerification) {
      res.cookie(
        "refreshToken",
        (result as any).refreshToken,
        REFRESH_COOKIE_OPTIONS,
      );
    }
    return sendSuccess(res, result, "Registered successfully", 201);
  },

  async verifyOtp(req: Request, res: Response) {
    const result = await authService.verifyOtp(req.body);
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      "Email verified",
    );
  },

  async resendOtp(req: Request, res: Response) {
    const result = await authService.resendOtp(req.body);
    return sendSuccess(res, result, "OTP resent");
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError("Refresh token missing", 401);
    const result = await authService.refresh(token);
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);
    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    if (token) await authService.logout(token);
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return sendSuccess(res, null, "Logged out successfully");
  },

  async me(req: Request, res: Response) {
    return sendSuccess(res, { user: req.user }, "Current user fetched");
  },

  async getProfile(req: Request, res: Response) {
    const profile = await authService.getProfile(req.user!.userId);
    return sendSuccess(res, { user: profile });
  },

  async updateProfile(req: Request, res: Response) {
    const profile = await authService.updateProfile(req.user!.userId, req.body);
    return sendSuccess(res, { user: profile }, "Profile updated");
  },
};
