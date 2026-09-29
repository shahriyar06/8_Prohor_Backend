import { Request, Response } from "express";
import { expenseService } from "./expense.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { getOrgContext } from "@/utils/getOrgContext";

export const expenseController = {
  async createCategory(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    await expenseService.createCategory(
      req.user!.userId,
      organizationId,
      req.body,
    );
    return sendSuccess(res, null, "Category created", 201);
  },

  async listCategories(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const categories = await expenseService.listCategories(
      req.user!.userId,
      organizationId ?? undefined,
      {
        onlyActive: req.query.active === "true",
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
      },
    );
    return sendSuccess(res, { categories });
  },

  async updateCategory(req: Request, res: Response) {
    const categoryId = req.params.categoryId as string;
    await expenseService.updateCategory(categoryId, req.body);
    return sendSuccess(res, null, "Category updated");
  },

  async deleteCategory(req: Request, res: Response) {
    const categoryId = req.params.categoryId as string;
    await expenseService.deleteCategory(categoryId);
    return sendSuccess(res, null, "Category deleted");
  },

  async createExpense(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new AppError("User not found", 404);
    const organizationId = await getOrgContext(req.user!.userId);
    const expense = await expenseService.createExpense(
      req.user!.userId,
      user.name,
      { ...req.body, organizationId: organizationId ?? undefined },
    );
    return sendSuccess(res, { expense }, "Expense added", 201);
  },

  async listExpenses(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const result = await expenseService.listExpenses(
      req.user!.userId,
      organizationId ?? undefined,
      {
        search: req.query.search as string | undefined,
        date: req.query.date as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 15,
      },
    );
    return sendSuccess(res, result);
  },

  async getExpenseById(req: Request, res: Response) {
    const expenseId = req.params.expenseId as string;
    const expense = await expenseService.getExpenseById(expenseId);
    return sendSuccess(res, { expense });
  },

  async updateExpense(req: Request, res: Response) {
    const expenseId = req.params.expenseId as string;
    await expenseService.updateExpense(expenseId, req.body);
    return sendSuccess(res, null, "Expense updated");
  },

  async deleteExpense(req: Request, res: Response) {
    const expenseId = req.params.expenseId as string;
    await expenseService.deleteExpense(expenseId);
    return sendSuccess(res, null, "Expense deleted");
  },

  async summary(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const summary = await expenseService.getSummary(
      req.user!.userId,
      organizationId ?? undefined,
    );
    return sendSuccess(res, { summary });
  },
};
