import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "@/middlewares/validate";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  updateProfileSchema,
} from "./auth.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  asyncHandler(authController.verifyOtp),
);
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  asyncHandler(authController.resendOtp),
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));
router.get("/profile", authenticate, asyncHandler(authController.getProfile));
router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

export default router;
