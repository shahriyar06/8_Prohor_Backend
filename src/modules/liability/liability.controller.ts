import { Request, Response } from "express";
import { liabilityService } from "./liability.service";
import { sendSuccess } from "@/utils/apiResponse";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export const liabilityController = {
  async create(req: Request, res: Response) {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);
    const liability = await liabilityService.createLiability(req.user!.userId, user.name, req.body);
    return sendSuccess(res, { liability }, "Liability added", 201);
  },

  async list(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const liabilities = await liabilityService.listLiabilities(req.user!.userId, organizationId);
    return sendSuccess(res, { liabilities });
  },

  async getById(req: Request, res: Response) {
    const liabilityId = req.params.liabilityId as string;
    const liability = await liabilityService.getLiabilityById(liabilityId);
    return sendSuccess(res, { liability });
  },

  async update(req: Request, res: Response) {
    const liabilityId = req.params.liabilityId as string;
    await liabilityService.updateLiability(liabilityId, req.body);
    return sendSuccess(res, null, "Liability updated");
  },

  async addPayment(req: Request, res: Response) {
    const liabilityId = req.params.liabilityId as string;
    const liability = await liabilityService.addPayment(liabilityId, req.body);
    return sendSuccess(res, { liability }, "Payment recorded");
  },

  async remove(req: Request, res: Response) {
    const liabilityId = req.params.liabilityId as string;
    await liabilityService.deleteLiability(liabilityId);
    return sendSuccess(res, null, "Liability deleted");
  },

  async summary(req: Request, res: Response) {
    const organizationId = req.query.organizationId as string | undefined;
    const summary = await liabilityService.getSummary(req.user!.userId, organizationId);
    return sendSuccess(res, { summary });
  },
};