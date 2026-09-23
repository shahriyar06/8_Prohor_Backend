import { Router } from "express";
import { liabilityController } from "./liability.controller";
import { validate } from "@/middlewares/validate";
import {
  createLiabilitySchema, updateLiabilitySchema, addPaymentSchema,
} from "./liability.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";

const router = Router();
router.use(authenticate);

router.get("/summary", asyncHandler(liabilityController.summary));
router.post("/", validate(createLiabilitySchema), asyncHandler(liabilityController.create));
router.get("/", asyncHandler(liabilityController.list));
router.get("/:liabilityId", asyncHandler(liabilityController.getById));
router.patch("/:liabilityId", validate(updateLiabilitySchema), asyncHandler(liabilityController.update));
router.post("/:liabilityId/payment", validate(addPaymentSchema), asyncHandler(liabilityController.addPayment));
router.delete("/:liabilityId", asyncHandler(liabilityController.remove));

export default router;