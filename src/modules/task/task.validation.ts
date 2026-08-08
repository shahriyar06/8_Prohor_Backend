import { z } from "zod";

const checklistItemSchema = z.object({
  text: z.string().min(1),
  order: z.number().default(0),
});

export const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  tag: z.string().optional(),

  organizationId: z.string().uuid().optional(), 

  checklistItems: z.array(checklistItemSchema).optional(),
  assigneeMemberIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  tag: z.string().optional(),
});

export const addChecklistItemSchema = z.object({
  text: z.string().min(1),
  order: z.number().default(0),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).optional(),
  isDone: z.boolean().optional(),
  order: z.number().optional(),
});

export const setAssigneesSchema = z.object({
  memberIds: z.array(z.string().uuid()), 
});

export const addCommentSchema = z.object({
  content: z.string().min(1),
  parentCommentId: z.string().uuid().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddChecklistItemInput = z.infer<typeof addChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
export type SetAssigneesInput = z.infer<typeof setAssigneesSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;