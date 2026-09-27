import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { PLAN_CONFIGS, getEffectivePlan } from "@/config/plans";

export function requirePlanAccess(routeKey: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);

    const effectivePlan = getEffectivePlan(user.accountType, user.subscriptionPlan, user.trialEndsAt);
    const config = PLAN_CONFIGS[effectivePlan];

    if (!config || !config.routes.includes(routeKey)) {
      throw new AppError("This feature requires a plan upgrade", 403);
    }
    next();
  };
}