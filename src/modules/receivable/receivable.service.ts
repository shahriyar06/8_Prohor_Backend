import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateReceivableInput, UpdateReceivableInput, AddReceiptInput,
} from "./receivable.validation";

function computeStatus(amount: number, receivedAmount: number): "pending" | "partial" | "received" {
  if (receivedAmount <= 0) return "pending";
  if (receivedAmount >= amount) return "received";
  return "partial";
}

export const receivableService = {
  async createReceivable(userId: string, userName: string, input: CreateReceivableInput) {
    return prisma.receivable.create({
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

  async listReceivables(userId: string, organizationId?: string) {
    return prisma.receivable.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
      orderBy: { dueDate: "asc" },
    });
  },

  async getReceivableById(receivableId: string) {
    const receivable = await prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new AppError("Receivable not found", 404);
    return receivable;
  },

  async updateReceivable(receivableId: string, input: UpdateReceivableInput) {
    const receivable = await prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new AppError("Receivable not found", 404);

    const newAmount = input.amount ?? Number(receivable.amount);
    const newStatus = computeStatus(newAmount, Number(receivable.receivedAmount));

    return prisma.receivable.update({
      where: { id: receivableId },
      data: { ...input, status: newStatus },
    });
  },

  async addReceipt(receivableId: string, input: AddReceiptInput) {
    const receivable = await prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new AppError("Receivable not found", 404);
    if (receivable.status === "received") throw new AppError("This receivable is already fully received", 400);

    const newReceivedAmount = Number(receivable.receivedAmount) + input.amount;
    if (newReceivedAmount > Number(receivable.amount)) {
      throw new AppError("Amount exceeds the remaining balance", 400);
    }

    const newStatus = computeStatus(Number(receivable.amount), newReceivedAmount);

    return prisma.receivable.update({
      where: { id: receivableId },
      data: { receivedAmount: newReceivedAmount, status: newStatus },
    });
  },

  async deleteReceivable(receivableId: string) {
    const receivable = await prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!receivable) throw new AppError("Receivable not found", 404);
    await prisma.receivable.delete({ where: { id: receivableId } });
  },

  async getSummary(userId: string, organizationId?: string) {
    const receivables = await prisma.receivable.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
    });
    const totalReceivable = receivables.reduce(
      (sum, r) => sum + Number(r.amount) - Number(r.receivedAmount), 0
    );
    const pendingCount = receivables.filter((r) => r.status !== "received").length;
    return { totalReceivable, pendingCount };
  },
};