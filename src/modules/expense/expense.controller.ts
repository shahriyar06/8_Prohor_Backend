import { Request, Response } from "express";
import { expenseService } from "./expense.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export const expenseController = {
  async createCategory(req: Request, res: Response) {
    await expenseService.createCategory(req.user!.userId, req.body);
    return sendSuccess(res, null, "Category created", 201);
  },
  async listCategories(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const categories = await expenseService.listCategories(req.user!.userId, organizationId);
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
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);
    const expense = await expenseService.createExpense(req.user!.userId, user.name, req.body);
    return sendSuccess(res, { expense }, "Expense added", 201);
  },
  async listExpenses(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const expenses = await expenseService.listExpenses(req.user!.userId, organizationId);
    return sendSuccess(res, { expenses });
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
};