import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc as platformAdminAc,
  defaultStatements as platformDefaultStatements,
  userAc as platformUserAc,
} from "better-auth/plugins/admin/access";
import {
  adminAc as orgAdminAc,
  defaultStatements as orgDefaultStatements,
  memberAc as orgMemberAc,
  ownerAc as orgOwnerAc,
} from "better-auth/plugins/organization/access";

// ── Platform-level access control (admin plugin) ──

const platformStatements = {
  ...platformDefaultStatements,
  course: ["create", "read", "update", "delete", "publish"],
  enrollment: ["create", "delete"],
} as const;

export const platformAc = createAccessControl(platformStatements);

export const platformAdmin = platformAc.newRole({
  course: ["create", "read", "update", "delete", "publish"],
  enrollment: ["create", "delete"],
  ...platformAdminAc.statements,
});

export const contentCreator = platformAc.newRole({
  course: ["create", "read", "update", "delete", "publish"],
  enrollment: ["create", "delete"],
  ...platformUserAc.statements,
});

export const platformStudent = platformAc.newRole({
  course: ["read"],
  enrollment: ["create", "delete"],
  ...platformUserAc.statements,
});

// ── Org-level access control (organization plugin) ──
const orgStatements = {
  ...orgDefaultStatements,
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
} as const;

export const orgAc = createAccessControl(orgStatements);

export const orgOwner = orgAc.newRole({
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgOwnerAc.statements,
});

export const orgAdmin = orgAc.newRole({
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgAdminAc.statements,
});

export const orgAuditor = orgAc.newRole({
  course: ["read"],
  enrollment: ["read"],
  report: ["read"],
  ...orgMemberAc.statements,
});

export const orgTeacher = orgAc.newRole({
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgMemberAc.statements,
});

export const orgStudent = orgAc.newRole({
  course: ["read"],
  enrollment: ["read"],
  ...orgMemberAc.statements,
});
