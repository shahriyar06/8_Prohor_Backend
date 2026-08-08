import { Request, Response } from "express";
import { taskService } from "./task.service";
import { sendSuccess } from "@/utils/apiResponse";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { AppError } from "@/utils/AppError";
import { prisma } from "@/config/prisma";

export const taskController = {
  async create(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new AppError("User not found", 404);

    const task = await taskService.createTask(
      req.user!.userId,
      user.name,
      req.body,
    );
    return sendSuccess(res, null, "Task created", 201);
  },

  async list(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const tasks = await taskService.listTasks(req.user!.userId, organizationId);
    return sendSuccess(res, { tasks });
  },

  async getById(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const task = await taskService.getTaskById(taskId, req.user!.userId, null);
    return sendSuccess(res, { task });
  },

  async update(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    await taskService.updateTask(taskId, req.user!.userId, req.body);
    return sendSuccess(res, null, "Task updated");
  },

  async remove(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    await taskService.deleteTask(taskId, req.user!.userId);
    return sendSuccess(res, null, "Task deleted");
  },

  async addChecklistItem(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    await taskService.addChecklistItem(taskId, req.user!.userId, req.body);
    return sendSuccess(res, null, "Checklist item added", 201);
  },

  async updateChecklistItem(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const itemId = req.params.itemId as string;
    await taskService.updateChecklistItem(
      taskId,
      itemId,
      req.user!.userId,
      req.body,
    );
    return sendSuccess(res, null, "Checklist item updated");
  },

  async deleteChecklistItem(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const itemId = req.params.itemId as string;
    await taskService.deleteChecklistItem(taskId, itemId, req.user!.userId);
    return sendSuccess(res, null, "Checklist item deleted");
  },

  async setAssignees(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    await taskService.setAssignees(taskId, req.user!.userId, req.body);
    return sendSuccess(res, null, "Assignees updated");
  },

  async addComment(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new AppError("User not found", 404);

    const taskId = req.params.taskId as string;
    await taskService.addComment(taskId, req.user!.userId, user.name, req.body);
    return sendSuccess(res, null, "Comment added", 201);
  },

  async toggleCommentLike(req: Request, res: Response) {
    const commentId = req.params.commentId as string;
    const result = await taskService.toggleCommentLike(
      commentId,
      req.user!.userId,
    );
    return sendSuccess(res, null, result.liked ? "Comment liked" : "Comment unliked");
  },

  async deleteComment(req: Request, res: Response) {
    const commentId = req.params.commentId as string;
    await taskService.deleteComment(commentId, req.user!.userId);
    return sendSuccess(res, null, "Comment deleted");
  },

  async addAttachment(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    if (!req.file) throw new AppError("No file uploaded", 400);

    const fileType = req.file.mimetype.startsWith("image/") ? "image" : "doc";
    const fileUrl = await uploadToCloudinary(
      req.file.buffer,
      `tasks/${taskId}/attachments`,
    );

    await taskService.addAttachment(
      taskId,
      req.user!.userId,
      fileUrl,
      fileType,
      req.file.originalname,
    );
    return sendSuccess(res, null, "Attachment added", 201);
  },

  async deleteAttachment(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const attachmentId = req.params.attachmentId as string;
    await taskService.deleteAttachment(taskId, attachmentId, req.user!.userId);
    return sendSuccess(res, null, "Attachment deleted");
  },
};
