import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  organizationId: z.string().uuid().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
});

export const createIncomeSchema = z.object({
  categoryId: z.string().uuid("Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().default("BDT"),
  source: z.string().optional(),
  note: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  date: z.coerce.date(),
  organizationId: z.string().uuid().optional(),
});

export const updateIncomeSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  source: z.string().optional(),
  note: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  date: z.coerce.date().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;