import { prisma } from "@/config/prisma";

export async function getOrgContext(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.accountType !== "organization") return null;

  const membership = await prisma.organizationMember.findFirst({ where: { userId } });
  return membership?.organizationId ?? null;
}