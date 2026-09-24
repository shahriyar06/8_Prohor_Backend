import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  permissions: z.array(z.string()).default([]),
}).refine((d) => d.name.toLowerCase() !== "admin", {
  message: "'Admin' is a reserved role name",
  path: ["name"],
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  prefix: z.string().min(1).max(10).optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const addMemberSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.string().uuid("Invalid role ID"),

  profilePhoto: z.string().url().optional(),
  phoneNumber: z.string().min(6, "Phone number is required"),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().optional(),
  nationality: z.string().min(2),
  address: z.string().min(2),
  designation: z.string().min(2),
  department: z.string().optional(),
  joinDate: z.coerce.date(),
  employmentType: z.enum(["full_time", "part_time", "volunteer", "intern"]),
  memberStatus: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const updateMemberRoleSchema = z.object({
  roleId: z.string().uuid("Invalid role ID"),
});

export const setRolePermissionsSchema = z.object({
  permissionKeys: z.array(z.string()),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type SetRolePermissionsInput = z.infer<typeof setRolePermissionsSchema>;