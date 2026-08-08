import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export async function requireOrgAdmin(req: Request, _res: Response, next: NextFunction) {
  const userId = req.user!.userId;
  const organizationId = req.params.organizationId as string;

  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    include: { role: true },
  });

  if (!membership) {
    throw new AppError("You are not a member of this organization", 403);
  }
  if (!membership.role.isSystem) {
    throw new AppError("Only the organization Admin can perform this action", 403);
  }

  next();
}