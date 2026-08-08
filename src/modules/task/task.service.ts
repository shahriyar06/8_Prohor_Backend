import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateTaskInput,
  UpdateTaskInput,
  AddChecklistItemInput,
  UpdateChecklistItemInput,
  SetAssigneesInput,
  AddCommentInput,
} from "./task.validation";
import { deleteFromCloudinary } from "@/utils/cloudinaryUpload";

export const taskService = {
  async createTask(userId: string, userName: string, input: CreateTaskInput) {
    const task = await prisma.$transaction(async (tx) => {
      const newTask = await tx.task.create({
        data: {
          userId,
          createdByName: userName,
          organizationId: input.organizationId,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          priority: input.priority,
          isRecurring: input.isRecurring,
          recurrenceRule: input.recurrenceRule,
          tag: input.tag,
        },
      });

      if (input.checklistItems?.length) {
        await tx.taskChecklistItem.createMany({
          data: input.checklistItems.map((item) => ({
            taskId: newTask.id,
            text: item.text,
            order: item.order,
          })),
        });
      }

      if (input.assigneeMemberIds?.length) {
        await tx.taskAssignee.createMany({
          data: input.assigneeMemberIds.map((memberId) => ({
            taskId: newTask.id,
            memberId,
          })),
        });
      }

      return newTask;
    });

    return this.getTaskById(task.id, userId, task.organizationId);
  },

  async getTaskById(
    taskId: string,
    userId: string,
    organizationId: string | null,
  ) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        attachments: true,
        checklistItems: { orderBy: { order: "asc" } },
        assignees: {
          include: {
            member: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        comments: {
          where: { parentCommentId: null },
          include: {
            replies: { include: { likes: true } },
            likes: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!task) throw new AppError("Task not found", 404);

    await this.checkAccess(task, userId);
    return task;
  },

  async checkAccess(
    task: { userId: string | null; organizationId: string | null; id: string },
    userId: string,
  ) {
    if (!task.organizationId) {
      if (task.userId !== userId) throw new AppError("Access denied", 403);
      return;
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: task.organizationId },
      include: { role: true },
    });
    if (!membership) throw new AppError("Access denied", 403);

    if (membership.role.isSystem) return; // org Admin সবসময় access পাবে

    const isAssigned = await prisma.taskAssignee.findFirst({
      where: { taskId: task.id, memberId: membership.id },
    });
    if (!isAssigned)
      throw new AppError(
        "Access denied: You are not assigned to this task",
        403,
      );
  },

  async listTasks(userId: string, organizationId?: string) {
    if (organizationId) {
      const membership = await prisma.organizationMember.findFirst({
        where: { userId, organizationId },
        include: { role: true },
      });
      if (!membership) throw new AppError("Access denied", 403);

      if (membership.role.isSystem) {
        return prisma.task.findMany({
          where: { organizationId },
          orderBy: { dueDate: "asc" },
        });
      }
      return prisma.task.findMany({
        where: {
          organizationId,
          assignees: { some: { memberId: membership.id } },
        },
        orderBy: { dueDate: "asc" },
      });
    }

    return prisma.task.findMany({
      where: { userId, organizationId: null },
      orderBy: { dueDate: "asc" },
    });
  },

  async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);

    return prisma.task.update({ where: { id: taskId }, data: input });
  },

  async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { attachments: true },
    });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);

    await Promise.all(
      task.attachments.map((att) => deleteFromCloudinary(att.fileUrl)),
    );

    await prisma.task.delete({ where: { id: taskId } });
  },

  // ---- CHECKLIST ----
  async addChecklistItem(
    taskId: string,
    userId: string,
    input: AddChecklistItemInput,
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);
    return prisma.taskChecklistItem.create({ data: { taskId, ...input } });
  },

  async updateChecklistItem(
    taskId: string,
    itemId: string,
    userId: string,
    input: UpdateChecklistItemInput,
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);
    return prisma.taskChecklistItem.update({
      where: { id: itemId },
      data: input,
    });
  },

  async deleteChecklistItem(taskId: string, itemId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);
    await prisma.taskChecklistItem.delete({ where: { id: itemId } });
  },

  // ---- ASSIGNEES ----
  async setAssignees(taskId: string, userId: string, input: SetAssigneesInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    if (!task.organizationId)
      throw new AppError("Personal tasks cannot have assignees", 400);
    await this.checkAccess(task, userId);

    await prisma.$transaction([
      prisma.taskAssignee.deleteMany({ where: { taskId } }),
      prisma.taskAssignee.createMany({
        data: input.memberIds.map((memberId) => ({ taskId, memberId })),
      }),
    ]);
  },

  // ---- COMMENTS ----
  async addComment(
    taskId: string,
    userId: string,
    userName: string,
    input: AddCommentInput,
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);

    return prisma.taskComment.create({
      data: {
        taskId,
        authorId: userId,
        authorName: userName,
        content: input.content,
        parentCommentId: input.parentCommentId,
      },
    });
  },

  async toggleCommentLike(commentId: string, userId: string) {
    const existing = await prisma.taskCommentLike.findFirst({
      where: { commentId, userId },
    });
    if (existing) {
      await prisma.taskCommentLike.delete({ where: { id: existing.id } });
      return { liked: false };
    }
    await prisma.taskCommentLike.create({ data: { commentId, userId } });
    return { liked: true };
  },

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new AppError("Comment not found", 404);
    if (comment.authorId !== userId)
      throw new AppError("You can only delete your own comment", 403);
    await prisma.taskComment.delete({ where: { id: commentId } });
  },

  // ---- ATTACHMENTS ----
  async addAttachment(
    taskId: string,
    userId: string,
    fileUrl: string,
    fileType: string,
    fileName: string,
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);
    return prisma.taskAttachment.create({
      data: { taskId, fileUrl, fileType, fileName },
    });
  },

  async deleteAttachment(taskId: string, attachmentId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError("Task not found", 404);
    await this.checkAccess(task, userId);
    await prisma.taskAttachment.delete({ where: { id: attachmentId } });
  },
};
