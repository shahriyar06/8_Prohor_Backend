import { Router } from "express";
import { organizationController } from "./organization.controller";
import { validate } from "@/middlewares/validate";
import {
  createRoleSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "./organization.validation";
import { asyncHandler } from "@/middlewares/errorHandler";
import { authenticate } from "@/middlewares/authMiddleware";
import { requireOrgAdmin } from "@/middlewares/orgMiddleware";
import { upload } from "@/middlewares/upload";

const router = Router({ mergeParams: true });

router.get("/:organizationId", authenticate, organizationController.get);
router.patch("/:organizationId", authenticate, requireOrgAdmin, validate(updateOrganizationSchema), asyncHandler(organizationController.update));

router.post("/:organizationId/roles", authenticate, requireOrgAdmin, validate(createRoleSchema), asyncHandler(organizationController.createRole));
router.get("/:organizationId/roles", authenticate, asyncHandler(organizationController.listRoles));
router.patch("/:organizationId/roles/:roleId", authenticate, requireOrgAdmin, validate(createRoleSchema), asyncHandler(organizationController.updateRole));
router.delete("/:organizationId/roles/:roleId", authenticate, requireOrgAdmin, asyncHandler(organizationController.deleteRole));

router.post(
  "/:organizationId/members",
  authenticate,
  requireOrgAdmin,
  upload.single("profilePhoto"),
  validate(addMemberSchema),
  asyncHandler(organizationController.addMember)
);
router.get("/:organizationId/members", authenticate, asyncHandler(organizationController.listMembers));
router.patch("/:organizationId/members/:memberId/role", authenticate, requireOrgAdmin, validate(updateMemberRoleSchema), asyncHandler(organizationController.updateMemberRole));
router.delete("/:organizationId/members/:memberId", authenticate, requireOrgAdmin, asyncHandler(organizationController.removeMember));

export default router;