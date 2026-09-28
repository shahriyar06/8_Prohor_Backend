import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateLiabilityInput,
  UpdateLiabilityInput,
  AddPaymentInput,
} from "./liability.validation";

function computeStatus(
  amount: number,
  paidAmount: number,
): "pending" | "partial" | "paid" {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= amount) return "paid";
  return "partial";
}

export const liabilityService = {
  async createLiability(
    userId: string,
    userName: string,
    input: CreateLiabilityInput,
  ) {
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

  async listLiabilities(
    userId: string,
    organizationId: string | undefined,
    filters: {
      search?: string;
      date?: string;
      status?: string;
      page: number;
      limit: number;
    },
  ) {
    const where: Record<string, unknown> = organizationId
      ? { organizationId }
      : { userId, organizationId: null };

    if (filters.search) {
      where.personName = { contains: filters.search, mode: "insensitive" };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
    }

    const [items, total] = await Promise.all([
      prisma.liability.findMany({
        where,
        orderBy: { dueDate: "asc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.liability.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getLiabilityById(liabilityId: string) {
    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });
    if (!liability) throw new AppError("Liability not found", 404);
    return liability;
  },

  async updateLiability(liabilityId: string, input: UpdateLiabilityInput) {
    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });
    if (!liability) throw new AppError("Liability not found", 404);

    const newAmount = input.amount ?? Number(liability.amount);
    const newStatus = computeStatus(newAmount, Number(liability.paidAmount));

    return prisma.liability.update({
      where: { id: liabilityId },
      data: { ...input, status: newStatus },
    });
  },

  async addPayment(liabilityId: string, input: AddPaymentInput) {
    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });
    if (!liability) throw new AppError("Liability not found", 404);
    if (liability.status === "paid")
      throw new AppError("This liability is already fully paid", 400);

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
    const liability = await prisma.liability.findUnique({
      where: { id: liabilityId },
    });
    if (!liability) throw new AppError("Liability not found", 404);
    await prisma.liability.delete({ where: { id: liabilityId } });
  },

  async getSummary(userId: string, organizationId?: string) {
    const liabilities = await prisma.liability.findMany({
      where: organizationId
        ? { organizationId }
        : { userId, organizationId: null },
    });

    const totalAmount = liabilities.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const paidAmount = liabilities
      .filter((l) => l.status === "paid")
      .reduce((sum, l) => sum + Number(l.amount), 0);
    const partialAmount = liabilities
      .filter((l) => l.status === "partial")
      .reduce((sum, l) => sum + Number(l.paidAmount), 0);
    const pendingAmount = liabilities
      .filter((l) => l.status === "pending")
      .reduce((sum, l) => sum + Number(l.amount), 0);

    return {
      total: liabilities.length,
      totalAmount,
      paid: liabilities.filter((l) => l.status === "paid").length,
      paidAmount,
      partial: liabilities.filter((l) => l.status === "partial").length,
      partialAmount,
      pending: liabilities.filter((l) => l.status === "pending").length,
      pendingAmount,
    };
  },
};
