import { Router } from "express";
import { taskController } from "./task.controller";
import { validate } from "@/middlewares/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  addChecklistItemSchema,
  updateChecklistItemSchema,
  setAssigneesSchema,
  addCommentSchema,
} from "./task.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";
import { upload } from "@/middlewares/upload";

const router = Router();

router.use(authenticate);

router.post("/", validate(createTaskSchema), asyncHandler(taskController.create));
router.get("/", asyncHandler(taskController.list));
router.get("/:taskId", asyncHandler(taskController.getById));
router.patch("/:taskId", validate(updateTaskSchema), asyncHandler(taskController.update));
router.delete("/:taskId", asyncHandler(taskController.remove));

router.post("/:taskId/checklist", validate(addChecklistItemSchema), asyncHandler(taskController.addChecklistItem));
router.patch("/:taskId/checklist/:itemId", validate(updateChecklistItemSchema), asyncHandler(taskController.updateChecklistItem));
router.delete("/:taskId/checklist/:itemId", asyncHandler(taskController.deleteChecklistItem));

router.put("/:taskId/assignees", validate(setAssigneesSchema), asyncHandler(taskController.setAssignees));

router.post("/:taskId/comments", validate(addCommentSchema), asyncHandler(taskController.addComment));
router.post("/comments/:commentId/like", asyncHandler(taskController.toggleCommentLike));
router.delete("/comments/:commentId", asyncHandler(taskController.deleteComment));

router.post("/:taskId/attachments", upload.single("file"), asyncHandler(taskController.addAttachment));
router.delete("/:taskId/attachments/:attachmentId", asyncHandler(taskController.deleteAttachment));

export default router;