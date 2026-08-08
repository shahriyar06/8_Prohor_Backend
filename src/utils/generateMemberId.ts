import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";

export async function generateMemberId(organizationId: string): Promise<string> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new AppError("Organization not found", 404);
  if (!org.prefix) throw new AppError("Organization prefix not set. Please set it first.", 400);

  const updatedOrg = await prisma.organization.update({
    where: { id: organizationId },
    data: { memberCounter: { increment: 1 } },
  });

  const paddedNumber = String(updatedOrg.memberCounter).padStart(4, "0");
  return `${org.prefix}-${paddedNumber}`;
}