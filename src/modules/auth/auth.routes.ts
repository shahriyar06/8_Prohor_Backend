import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "@/middlewares/validate";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  updateProfileSchema,
  updateLanguageSchema,
  changePasswordSchema,
} from "./auth.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";
import { upload } from "@/middlewares/upload";
import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many requests, try again later." },
});

function parsePriorityColors(req: Request, _res: Response, next: NextFunction) {
  if (req.body.priorityColors && typeof req.body.priorityColors === "string") {
    try {
      req.body.priorityColors = JSON.parse(req.body.priorityColors);
    } catch {
      // parse fail হলে validation নিজেই পরে error দিবে
    }
  }
  next();
}

const router = Router();

router.post(
  "/register",
  strictLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  strictLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post(
  "/verify-otp",
  strictLimiter,
  validate(verifyOtpSchema),
  asyncHandler(authController.verifyOtp),
);
router.post(
  "/resend-otp",
  strictLimiter,
  validate(resendOtpSchema),
  asyncHandler(authController.resendOtp),
);
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));
router.get("/profile", authenticate, asyncHandler(authController.getProfile));
router.patch(
  "/profile",
  authenticate,
  upload.single("profilePhoto"),
  parsePriorityColors,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);
router.patch(
  "/language",
  authenticate,
  validate(updateLanguageSchema),
  asyncHandler(authController.updateLanguage),
);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword),
);

export default router;
