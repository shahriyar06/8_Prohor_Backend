import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateCategoryInput, UpdateCategoryInput, CreateExpenseInput, UpdateExpenseInput,
} from "./expense.validation";

export const expenseService = {
  async createCategory(userId: string, input: CreateCategoryInput) {
    const existing = await prisma.expenseCategory.findFirst({
      where: input.organizationId
        ? { organizationId: input.organizationId, name: { equals: input.name, mode: "insensitive" } }
        : { userId, organizationId: null, name: { equals: input.name, mode: "insensitive" } },
    });
    if (existing) throw new AppError("Category with this name already exists", 409);

    return prisma.expenseCategory.create({
      data: {
        name: input.name,
        userId: input.organizationId ? null : userId,
        organizationId: input.organizationId ?? null,
        isDefault: false,
      },
    });
  },

  async listCategories(userId: string, organizationId?: string) {
    return prisma.expenseCategory.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
      orderBy: [{ isDefault: "asc" }, { createdAt: "asc" }],
    });
  },

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault) throw new AppError("Default category cannot be renamed", 403);
    return prisma.expenseCategory.update({ where: { id: categoryId }, data: { name: input.name } });
  },

  async deleteCategory(categoryId: string) {
    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault) throw new AppError("Default category cannot be deleted", 403);

    const count = await prisma.expense.count({ where: { categoryId } });
    if (count > 0) throw new AppError("Cannot delete a category that has expense entries", 400);

    await prisma.expenseCategory.delete({ where: { id: categoryId } });
  },

  async createExpense(userId: string, userName: string, input: CreateExpenseInput) {
    const category = await prisma.expenseCategory.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new AppError("Category not found", 404);

    return prisma.expense.create({
      data: {
        userId, createdByName: userName, organizationId: input.organizationId,
        categoryId: input.categoryId, amount: input.amount, currency: input.currency,
        paymentMethod: input.paymentMethod, note: input.note,
        isRecurring: input.isRecurring, recurrenceRule: input.recurrenceRule, date: input.date,
      },
      include: { category: true },
    });
  },

  async listExpenses(userId: string, organizationId?: string) {
    return prisma.expense.findMany({
      where: organizationId ? { organizationId } : { userId, organizationId: null },
      include: { category: true },
      orderBy: { date: "desc" },
    });
  },

  async getExpenseById(expenseId: string) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId }, include: { category: true } });
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  },

  async updateExpense(expenseId: string, input: UpdateExpenseInput) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new AppError("Expense not found", 404);

    if (input.categoryId) {
      const category = await prisma.expenseCategory.findUnique({ where: { id: input.categoryId } });
      if (!category) throw new AppError("Category not found", 404);
    }

    return prisma.expense.update({ where: { id: expenseId }, data: input, include: { category: true } });
  },

  async deleteExpense(expenseId: string) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new AppError("Expense not found", 404);
    await prisma.expense.delete({ where: { id: expenseId } });
  },
};