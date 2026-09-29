import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  organizationId: z.string().uuid().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid("Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().default("BDT"),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  date: z.coerce.date(),
  organizationId: z.string().uuid().optional(),
});

export const updateExpenseSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  date: z.coerce.date().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;