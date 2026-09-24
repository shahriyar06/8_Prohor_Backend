import { NextFunction, Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export function requirePermission(permissionKey: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.user!.userId;
    const organizationId = req.body.organizationId || req.query.organizationId;

    if (!organizationId) {
      return next(); // personal context, কোনো org permission প্রযোজ্য না
    }

    const membership = await prisma.organizationMember.findFirst({
      where: { userId, organizationId: organizationId as string },
      include: { role: { include: { permissions: true } } },
    });

    if (!membership) throw new AppError("Not a member of this organization", 403);
    if (membership.role.isSystem) return next(); // Admin সবসময় পাস

    const hasPermission = membership.role.permissions.some((p) => p.permissionKey === permissionKey);
    if (!hasPermission) throw new AppError("You don't have permission for this action", 403);

    next();
  };
}