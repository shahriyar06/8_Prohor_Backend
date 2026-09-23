import { z } from "zod";

export const createLiabilitySchema = z.object({
  personName: z.string().min(2, "Person name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().default("BDT"),
  reason: z.string().optional(),
  dueDate: z.coerce.date(),
  remindBeforeDays: z.coerce.number().int().positive().optional(),
  organizationId: z.string().uuid().optional(),
});

export const updateLiabilitySchema = z.object({
  personName: z.string().min(2).optional(),
  amount: z.coerce.number().positive().optional(),
  currency: z.string().optional(),
  reason: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  remindBeforeDays: z.coerce.number().int().positive().optional(),
});

export const addPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
});

export type CreateLiabilityInput = z.infer<typeof createLiabilitySchema>;
export type UpdateLiabilityInput = z.infer<typeof updateLiabilitySchema>;
export type AddPaymentInput = z.infer<typeof addPaymentSchema>;