import { Request, Response } from "express";
import { incomeService } from "./income.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { getOrgContext } from "@/utils/getOrgContext";

export const incomeController = {
  // async createCategory(req: Request, res: Response) {
  //   await incomeService.createCategory(req.user!.userId, req.body);
  //   return sendSuccess(res, null, "Category created", 201);
  // },

  async createCategory(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    await incomeService.createCategory(
      req.user!.userId,
      organizationId,
      req.body,
    );
    return sendSuccess(res, null, "Category created", 201);
  },

  // async listCategories(req: Request, res: Response) {
  //   const organizationId = req.query.organizationId as string | undefined;
  //   const categories = await incomeService.listCategories(
  //     req.user!.userId,
  //     organizationId,
  //   );
  //   return sendSuccess(res, { categories });
  // },

  async listCategories(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const onlyActive = req.query.active === "true";
    const categories = await incomeService.listCategories(
      req.user!.userId,
      organizationId ?? undefined,
      onlyActive,
    );
    return sendSuccess(res, { categories });
  },

  async updateCategory(req: Request, res: Response) {
    const categoryId = req.params.categoryId as string;
    await incomeService.updateCategory(categoryId, req.body);
    return sendSuccess(res, null, "Category updated");
  },

  async deleteCategory(req: Request, res: Response) {
    const categoryId = req.params.categoryId as string;
    await incomeService.deleteCategory(categoryId);
    return sendSuccess(res, null, "Category deleted");
  },

  // async createIncome(req: Request, res: Response) {
  //   const user = await prisma.user.findUnique({
  //     where: { id: req.user!.userId },
  //   });
  //   if (!user) throw new AppError("User not found", 404);

  //   const income = await incomeService.createIncome(
  //     req.user!.userId,
  //     user.name,
  //     req.body,
  //   );
  //   return sendSuccess(res, { income }, "Income added", 201);
  // },

  async createIncome(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new AppError("User not found", 404);
    const organizationId = await getOrgContext(req.user!.userId);
    const income = await incomeService.createIncome(
      req.user!.userId,
      user.name,
      { ...req.body, organizationId: organizationId ?? undefined },
    );
    return sendSuccess(res, { income }, "Income added", 201);
  },

  // async listIncomes(req: Request, res: Response) {
  //   const organizationId = req.query.organizationId as string | undefined;
  //   const incomes = await incomeService.listIncomes(
  //     req.user!.userId,
  //     organizationId,
  //   );
  //   return sendSuccess(res, { incomes });
  // },

  async listIncomes(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const result = await incomeService.listIncomes(
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

  async getIncomeById(req: Request, res: Response) {
    const incomeId = req.params.incomeId as string;
    const income = await incomeService.getIncomeById(incomeId);
    return sendSuccess(res, { income });
  },

  async updateIncome(req: Request, res: Response) {
    const incomeId = req.params.incomeId as string;
    await incomeService.updateIncome(incomeId, req.body);
    return sendSuccess(res, null, "Income updated");
  },

  async deleteIncome(req: Request, res: Response) {
    const incomeId = req.params.incomeId as string;
    await incomeService.deleteIncome(incomeId);
    return sendSuccess(res, null, "Income deleted");
  },

  async summary(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const summary = await incomeService.getSummary(
      req.user!.userId,
      organizationId ?? undefined,
    );
    return sendSuccess(res, { summary });
  },
};
