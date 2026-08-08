import { Request, Response } from "express";
import { organizationService } from "./organization.service";
import { sendSuccess } from "@/utils/apiResponse";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";

export const organizationController = {
  async update(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    await organizationService.updateOrganization(organizationId, req.body);
    return sendSuccess(res, null, "Organization updated");
  },

  async get(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const org = await organizationService.getOrganization(organizationId);
    return sendSuccess(res, { organization: org });
  },

  async createRole(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    await organizationService.createRole(organizationId, req.body);
    return sendSuccess(res, null, "Role created", 201);
  },

  async listRoles(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const roles = await organizationService.listRoles(organizationId);
    return sendSuccess(res, { roles });
  },

  async updateRole(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const roleId = req.params.roleId as string;
    await organizationService.updateRole(organizationId, roleId, req.body);
    return sendSuccess(res, null, "Role updated");
  },

  async deleteRole(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const roleId = req.params.roleId as string;
    await organizationService.deleteRole(organizationId, roleId);
    return sendSuccess(res, null, "Role deleted");
  },

  async addMember(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    let profilePhotoUrl: string | undefined;
    if (req.file) {
      profilePhotoUrl = await uploadToCloudinary(
        req.file.buffer,
        `organizations/${organizationId}/members`
      );
    }
    await organizationService.addMember(organizationId, {
      ...req.body,
      profilePhoto: profilePhotoUrl,
    });
    return sendSuccess(res, null, "Member added", 201);
  },

  async listMembers(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const members = await organizationService.listMembers(organizationId);
    return sendSuccess(res, { members });
  },

  async updateMemberRole(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const memberId = req.params.memberId as string;
    await organizationService.updateMemberRole(organizationId, memberId, req.body);
    return sendSuccess(res, null, "Member role updated");
  },

  async removeMember(req: Request, res: Response) {
    const organizationId = req.params.organizationId as string;
    const memberId = req.params.memberId as string;
    await organizationService.removeMember(organizationId, memberId);
    return sendSuccess(res, null, "Member removed");
  },
};