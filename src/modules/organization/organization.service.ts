import bcrypt from "bcrypt";
import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/AppError";
import { generateMemberId } from "@/utils/generateMemberId";
import {
  CreateRoleInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from "./organization.validation";

const SALT_ROUNDS = 10;

export const organizationService = {
  async updateOrganization(
    organizationId: string,
    input: UpdateOrganizationInput,
  ) {
    if (input.prefix) {
      const existing = await prisma.organization.findFirst({
        where: { id: organizationId, prefix: input.prefix },
      });
    }

    return prisma.organization.update({
      where: { id: organizationId },
      data: input,
    });
  },

  async getOrganization(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new AppError("Organization not found", 404);
    return org;
  },

  async createRole(organizationId: string, input: CreateRoleInput) {
    const existing = await prisma.role.findFirst({
      where: {
        organizationId,
        name: { equals: input.name, mode: "insensitive" },
      },
    });
    if (existing) throw new AppError("Role with this name already exists", 409);

    return prisma.role.create({
      data: {
        organizationId,
        name: input.name,
        isSystem: false,
        permissions: {
          create: input.permissions.map((key) => ({ permissionKey: key })),
        },
      },
      include: { permissions: true },
    });
  },

  async listRoles(organizationId: string) {
    return prisma.role.findMany({
      where: { organizationId },
      include: { permissions: true },
    });
  },

  async updateRole(
    organizationId: string,
    roleId: string,
    input: CreateRoleInput,
  ) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });
    if (!role) throw new AppError("Role not found", 404);
    if (role.isSystem)
      throw new AppError("System role (Admin) cannot be modified", 403);

    await prisma.rolePermission.deleteMany({ where: { roleId } });

    return prisma.role.update({
      where: { id: roleId },
      data: {
        name: input.name,
        permissions: {
          create: input.permissions.map((key) => ({ permissionKey: key })),
        },
      },
      include: { permissions: true },
    });
  },

  async deleteRole(organizationId: string, roleId: string) {
    const role = await prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });
    if (!role) throw new AppError("Role not found", 404);
    if (role.isSystem)
      throw new AppError("System role (Admin) cannot be deleted", 403);

    const memberCount = await prisma.organizationMember.count({
      where: { roleId },
    });
    if (memberCount > 0) {
      throw new AppError(
        "Cannot delete a role that is still assigned to members",
        400,
      );
    }

    await prisma.role.delete({ where: { id: roleId } });
  },

  async addMember(organizationId: string, input: AddMemberInput) {
    const role = await prisma.role.findFirst({
      where: { id: input.roleId, organizationId },
    });
    if (!role) throw new AppError("Role not found in this organization", 404);
    if (role.isSystem)
      throw new AppError(
        "Cannot assign the reserved Admin role to a new member",
        403,
      );

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) throw new AppError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const memberId = await generateMemberId(organizationId);

    const member = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          accountType: "organization",
          isEmailVerified: true,
        },
      });

      const orgMember = await tx.organizationMember.create({
        data: { organizationId, userId: user.id, roleId: input.roleId },
      });

      const profile = await tx.memberProfile.create({
        data: {
          organizationMemberId: orgMember.id,
          memberId,
          profilePhoto: input.profilePhoto,
          phoneNumber: input.phoneNumber,
          dateOfBirth: input.dateOfBirth,
          gender: input.gender,
          bloodGroup: input.bloodGroup,
          nationality: input.nationality,
          address: input.address,
          designation: input.designation,
          department: input.department,
          joinDate: input.joinDate,
          employmentType: input.employmentType,
          memberStatus: input.memberStatus,
        },
      });

      const { passwordHash: _, ...safeUser } = user;
      return { ...orgMember, user: safeUser, profile };
    });

    return member;
  },

  async listMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: true,
        profile: true,
      },
    });
  },

  async updateMemberRole(
    organizationId: string,
    memberId: string,
    input: UpdateMemberRoleInput,
  ) {
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
      include: { role: true },
    });
    if (!member) throw new AppError("Member not found", 404);
    if (member.role.isSystem)
      throw new AppError(
        "Cannot change the role of the organization's Admin",
        403,
      );

    const newRole = await prisma.role.findFirst({
      where: { id: input.roleId, organizationId },
    });
    if (!newRole)
      throw new AppError("Role not found in this organization", 404);
    if (newRole.isSystem)
      throw new AppError("Cannot assign the reserved Admin role", 403);

    return prisma.organizationMember.update({
      where: { id: memberId },
      data: { roleId: input.roleId },
      include: { user: true, role: true, profile: true },
    });
  },

  async removeMember(organizationId: string, memberId: string) {
    const member = await prisma.organizationMember.findFirst({
      where: { id: memberId, organizationId },
      include: { role: true },
    });
    if (!member) throw new AppError("Member not found", 404);
    if (member.role.isSystem)
      throw new AppError("Cannot remove the organization's Admin", 403);

    try {
      await prisma.user.delete({ where: { id: member.userId } });
    } catch (err) {
      console.error(
        "Delete user failed:",
        err instanceof Error ? err.message : err,
      );
      throw new AppError("Failed to remove member. Please try again.", 500);
    }
  },
};
