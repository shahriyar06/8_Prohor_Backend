import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateIncomeInput,
  UpdateIncomeInput,
} from "./income.validation";

export const incomeService = {
  // ---- CATEGORY ----

  async createCategory(userId: string, input: CreateCategoryInput) {
    const existing = await prisma.incomeCategory.findFirst({
      where: input.organizationId
        ? { organizationId: input.organizationId, name: { equals: input.name, mode: "insensitive" } }
        : { userId, organizationId: null, name: { equals: input.name, mode: "insensitive" } },
    });
    if (existing) throw new AppError("Category with this name already exists", 409);

    return prisma.incomeCategory.create({
      data: {
        name: input.name,
        userId: input.organizationId ? null : userId,
        organizationId: input.organizationId ?? null,
        isDefault: false,
      },
    });
  },

  async listCategories(userId: string, organizationId?: string) {
    return prisma.incomeCategory.findMany({
      where: organizationId
        ? { organizationId }
        : { userId, organizationId: null },
      orderBy: [{ isDefault: "asc" }, { createdAt: "asc" }],
    });
  },

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const category = await prisma.incomeCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault) throw new AppError("Default category cannot be renamed", 403);

    return prisma.incomeCategory.update({ where: { id: categoryId }, data: { name: input.name } });
  },

  async deleteCategory(categoryId: string) {
    const category = await prisma.incomeCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault) throw new AppError("Default category cannot be deleted", 403);

    const incomeCount = await prisma.income.count({ where: { categoryId } });
    if (incomeCount > 0) {
      throw new AppError("Cannot delete a category that has income entries", 400);
    }

    await prisma.incomeCategory.delete({ where: { id: categoryId } });
  },

  // ---- INCOME ----

  async createIncome(userId: string, userName: string, input: CreateIncomeInput) {
    const category = await prisma.incomeCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError("Category not found", 404);

    return prisma.income.create({
      data: {
        userId,
        createdByName: userName,
        organizationId: input.organizationId,
        categoryId: input.categoryId,
        amount: input.amount,
        currency: input.currency,
        source: input.source,
        note: input.note,
        isRecurring: input.isRecurring,
        recurrenceRule: input.recurrenceRule,
        date: input.date,
      },
      include: { category: true },
    });
  },

  async listIncomes(userId: string, organizationId?: string) {
    return prisma.income.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
      include: { category: true },
      orderBy: { date: "desc" },
    });
  },

  async getIncomeById(incomeId: string) {
    const income = await prisma.income.findUnique({
      where: { id: incomeId },
      include: { category: true },
    });
    if (!income) throw new AppError("Income not found", 404);
    return income;
  },

  async updateIncome(incomeId: string, input: UpdateIncomeInput) {
    const income = await prisma.income.findUnique({ where: { id: incomeId } });
    if (!income) throw new AppError("Income not found", 404);

    if (input.categoryId) {
      const category = await prisma.incomeCategory.findUnique({ where: { id: input.categoryId } });
      if (!category) throw new AppError("Category not found", 404);
    }

    return prisma.income.update({
      where: { id: incomeId },
      data: input,
      include: { category: true },
    });
  },

  async deleteIncome(incomeId: string) {
    const income = await prisma.income.findUnique({ where: { id: incomeId } });
    if (!income) throw new AppError("Income not found", 404);
    await prisma.income.delete({ where: { id: incomeId } });
  },
};