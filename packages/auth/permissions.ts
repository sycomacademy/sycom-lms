import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements as adminDefaultStatements,
  adminAc as platformAdminAc,
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
  ...adminDefaultStatements,
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

export const student = platformAc.newRole({
  course: ["read"],
  enrollment: ["create", "delete"],
  ...platformUserAc.statements,
});

// ── Org-level access control (organization plugin) ──
const orgStatements = {
  ...orgDefaultStatements,
  cohort: ["create", "read", "update", "delete"],
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
} as const;

export const orgAc = createAccessControl(orgStatements);

export const orgOwner = orgAc.newRole({
  cohort: ["create", "read", "update", "delete"],
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgOwnerAc.statements,
});

export const orgAdmin = orgAc.newRole({
  cohort: ["create", "read", "update", "delete"],
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgAdminAc.statements,
});

export const orgAuditor = orgAc.newRole({
  cohort: ["read"],
  course: ["read"],
  enrollment: ["read"],
  report: ["read"],
  ...orgMemberAc.statements,
});

export const orgTeacher = orgAc.newRole({
  cohort: ["read", "update"],
  course: ["assign", "read"],
  enrollment: ["create", "read", "delete"],
  report: ["read"],
  ...orgMemberAc.statements,
});

export const orgStudent = orgAc.newRole({
  cohort: ["read"],
  course: ["read"],
  enrollment: ["read"],
  ...orgMemberAc.statements,
});
