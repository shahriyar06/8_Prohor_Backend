import { Request, Response } from "express";
import { receivableService } from "./receivable.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { getOrgContext } from "@/utils/getOrgContext";

export const receivableController = {
  async create(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user) throw new AppError("User not found", 404);
    const organizationId = await getOrgContext(req.user!.userId);

    const receivable = await receivableService.createReceivable(
      req.user!.userId,
      user.name,
      {
        ...req.body,
        organizationId: organizationId ?? undefined,
      },
    );
    return sendSuccess(res, { receivable }, "Receivable added", 201);
  },

  async list(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const result = await receivableService.listReceivables(
      req.user!.userId,
      organizationId ?? undefined,
      {
        search: req.query.search as string | undefined,
        date: req.query.date as string | undefined,
        status: req.query.status as string | undefined,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 15,
      },
    );
    return sendSuccess(res, result);
  },

  async summary(req: Request, res: Response) {
    const organizationId = await getOrgContext(req.user!.userId);
    const summary = await receivableService.getSummary(
      req.user!.userId,
      organizationId ?? undefined,
    );
    return sendSuccess(res, { summary });
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
    const receivable = await receivableService.addReceipt(
      receivableId,
      req.body,
    );
    return sendSuccess(res, { receivable }, "Receipt recorded");
  },

  async remove(req: Request, res: Response) {
    const receivableId = req.params.receivableId as string;
    await receivableService.deleteReceivable(receivableId);
    return sendSuccess(res, null, "Receivable deleted");
  },
};
