import { Request, Response } from "express";
import { receivableService } from "./receivable.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export const receivableController = {
  async create(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);
    const receivable = await receivableService.createReceivable(req.user!.userId, user.name, req.body);
    return sendSuccess(res, { receivable }, "Receivable added", 201);
  },

  async list(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const receivables = await receivableService.listReceivables(req.user!.userId, organizationId);
    return sendSuccess(res, { receivables });
  },

  async getById(req: Request, res: Response) {
    const receivableId = req.params.receivableId as string;
    const receivable = await receivableService.getReceivableById(receivableId);
    return sendSuccess(res, { receivable });
  },

  async update(req: Request, res: Response) {
    const receivableId = req.params.receivableId as string;
    await receivableService.updateReceivable(receivableId, req.body);
    return sendSuccess(res, null, "Receivable updated");
  },

  async addReceipt(req: Request, res: Response) {
    const receivableId = req.params.receivableId as string;
    const receivable = await receivableService.addReceipt(receivableId, req.body);
    return sendSuccess(res, { receivable }, "Receipt recorded");
  },

  async remove(req: Request, res: Response) {
    const receivableId = req.params.receivableId as string;
    await receivableService.deleteReceivable(receivableId);
    return sendSuccess(res, null, "Receivable deleted");
  },

  async summary(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const summary = await receivableService.getSummary(req.user!.userId, organizationId);
    return sendSuccess(res, { summary });
  },
};