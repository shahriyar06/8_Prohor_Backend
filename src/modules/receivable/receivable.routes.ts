import { Router } from "express";
import { receivableController } from "./receivable.controller";
import { validate } from "@/middlewares/validate";
import {
  createReceivableSchema, updateReceivableSchema, addReceiptSchema,
} from "./receivable.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";

const router = Router();
router.use(authenticate);

router.get("/summary", asyncHandler(receivableController.summary));
router.post("/", validate(createReceivableSchema), asyncHandler(receivableController.create));
router.get("/", asyncHandler(receivableController.list));
router.get("/:receivableId", asyncHandler(receivableController.getById));
router.patch("/:receivableId", validate(updateReceivableSchema), asyncHandler(receivableController.update));
router.post("/:receivableId/receipt", validate(addReceiptSchema), asyncHandler(receivableController.addReceipt));
router.delete("/:receivableId", asyncHandler(receivableController.remove));

export default router;