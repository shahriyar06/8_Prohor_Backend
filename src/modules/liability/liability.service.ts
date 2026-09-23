import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateLiabilityInput, UpdateLiabilityInput, AddPaymentInput,
} from "./liability.validation";

function computeStatus(amount: number, paidAmount: number): "pending" | "partial" | "paid" {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= amount) return "paid";
  return "partial";
}

export const liabilityService = {
  async createLiability(userId: string, userName: string, input: CreateLiabilityInput) {
    return prisma.liability.create({
      data: {
        userId,
        createdByName: userName,
        organizationId: input.organizationId,
        personName: input.personName,
        amount: input.amount,
        currency: input.currency,
        reason: input.reason,
        dueDate: input.dueDate,
        remindBeforeDays: input.remindBeforeDays,
        status: "pending",
      },
    });
  },

  async listLiabilities(userId: string, organizationId?: string) {
    return prisma.liability.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
      orderBy: { dueDate: "asc" },
    });
  },

  async getLiabilityById(liabilityId: string) {
    const liability = await prisma.liability.findUnique({ where: { id: liabilityId } });
    if (!liability) throw new AppError("Liability not found", 404);
    return liability;
  },

  async updateLiability(liabilityId: string, input: UpdateLiabilityInput) {
    const liability = await prisma.liability.findUnique({ where: { id: liabilityId } });
    if (!liability) throw new AppError("Liability not found", 404);

    const newAmount = input.amount ?? Number(liability.amount);
    const newStatus = computeStatus(newAmount, Number(liability.paidAmount));

    return prisma.liability.update({
      where: { id: liabilityId },
      data: { ...input, status: newStatus },
    });
  },

  async addPayment(liabilityId: string, input: AddPaymentInput) {
    const liability = await prisma.liability.findUnique({ where: { id: liabilityId } });
    if (!liability) throw new AppError("Liability not found", 404);
    if (liability.status === "paid") throw new AppError("This liability is already fully paid", 400);

    const newPaidAmount = Number(liability.paidAmount) + input.amount;
    if (newPaidAmount > Number(liability.amount)) {
      throw new AppError("Payment amount exceeds the remaining balance", 400);
    }

    const newStatus = computeStatus(Number(liability.amount), newPaidAmount);

    return prisma.liability.update({
      where: { id: liabilityId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });
  },

  async deleteLiability(liabilityId: string) {
    const liability = await prisma.liability.findUnique({ where: { id: liabilityId } });
    if (!liability) throw new AppError("Liability not found", 404);
    await prisma.liability.delete({ where: { id: liabilityId } });
  },

  async getSummary(userId: string, organizationId?: string) {
    const liabilities = await prisma.liability.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
    });
    const totalOwed = liabilities.reduce((sum, l) => sum + Number(l.amount) - Number(l.paidAmount), 0);
    const pendingCount = liabilities.filter((l) => l.status !== "paid").length;
    return { totalOwed, pendingCount };
  },
};