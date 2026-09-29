import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./expense.validation";

export const expenseService = {
  async createCategory(
    userId: string,
    organizationId: string | null,
    input: { name: string },
  ) {
    const existing = await prisma.expenseCategory.findFirst({
      where: organizationId
        ? { organizationId, name: { equals: input.name, mode: "insensitive" } }
        : {
            userId,
            organizationId: null,
            name: { equals: input.name, mode: "insensitive" },
          },
    });
    if (existing)
      throw new AppError("Category with this name already exists", 409);

    return prisma.expenseCategory.create({
      data: {
        name: input.name,
        userId: organizationId ? null : userId,
        organizationId,
        isDefault: false,
      },
    });
  },

  async listCategories(
    userId: string,
    organizationId: string | undefined,
    filters: { onlyActive?: boolean; search?: string; status?: string },
  ) {
    const where: Record<string, unknown> = organizationId
      ? { organizationId }
      : { userId, organizationId: null };
    if (filters.onlyActive) where.isActive = true;
    if (filters.search)
      where.name = { contains: filters.search, mode: "insensitive" };
    if (filters.status && filters.status !== "all")
      where.isActive = filters.status === "active";

    return prisma.expenseCategory.findMany({
      where,
      orderBy: [{ isDefault: "asc" }, { createdAt: "asc" }],
    });
  },

  async updateCategory(
    categoryId: string,
    input: { name?: string; isActive?: boolean },
  ) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault && input.name)
      throw new AppError("Default category cannot be renamed", 403);
    return prisma.expenseCategory.update({
      where: { id: categoryId },
      data: input,
    });
  },

  async deleteCategory(categoryId: string) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new AppError("Category not found", 404);
    if (category.isDefault)
      throw new AppError("Default category cannot be deleted", 403);

    const count = await prisma.expense.count({ where: { categoryId } });
    if (count > 0)
      throw new AppError(
        "Cannot delete a category that has expense entries",
        400,
      );

    await prisma.expenseCategory.delete({ where: { id: categoryId } });
  },

  async createExpense(
    userId: string,
    userName: string,
    input: CreateExpenseInput,
  ) {
    const category = await prisma.expenseCategory.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError("Category not found", 404);

    return prisma.expense.create({
      data: {
        userId,
        createdByName: userName,
        organizationId: input.organizationId,
        categoryId: input.categoryId,
        amount: input.amount,
        currency: input.currency,
        paymentMethod: input.paymentMethod,
        note: input.note,
        isRecurring: input.isRecurring,
        recurrenceRule: input.recurrenceRule,
        date: input.date,
      },
      include: { category: true },
    });
  },

  async listExpenses(
    userId: string,
    organizationId: string | undefined,
    filters: { search?: string; date?: string; page: number; limit: number },
  ) {
    const where: Record<string, unknown> = organizationId
      ? { organizationId }
      : { userId, organizationId: null };

    if (filters.search) {
      where.OR = [
        { paymentMethod: { contains: filters.search, mode: "insensitive" } },
        {
          category: { name: { contains: filters.search, mode: "insensitive" } },
        },
      ];
    }
    if (filters.date) {
      const start = new Date(filters.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.expense.count({ where }),
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

  async getExpenseById(expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { category: true },
    });
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  },

  async updateExpense(expenseId: string, input: UpdateExpenseInput) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) throw new AppError("Expense not found", 404);

    if (input.categoryId) {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) throw new AppError("Category not found", 404);
    }

    return prisma.expense.update({
      where: { id: expenseId },
      data: input,
      include: { category: true },
    });
  },

  async deleteExpense(expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) throw new AppError("Expense not found", 404);
    await prisma.expense.delete({ where: { id: expenseId } });
  },

  async getSummary(userId: string, organizationId?: string) {
    const base = organizationId
      ? { organizationId }
      : { userId, organizationId: null };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    const [all, month, today] = await Promise.all([
      prisma.expense.aggregate({ where: base, _sum: { amount: true } }),
      prisma.expense.aggregate({
        where: { ...base, date: { gte: monthStart } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { ...base, date: { gte: todayStart } },
        _sum: { amount: true },
      }),
    ]);

    return {
      total: Number(all._sum.amount ?? 0),
      thisMonth: Number(month._sum.amount ?? 0),
      today: Number(today._sum.amount ?? 0),
    };
  },
};
