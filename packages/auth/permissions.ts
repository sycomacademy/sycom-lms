import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  course: ["create", "read", "update", "delete"],
  enrollment: ["create", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const student = ac.newRole({
  course: ["read"],
  enrollment: ["create", "delete"],
  ...userAc.statements,
});

export const instructor = ac.newRole({
  course: ["create", "read", "update", "delete"],
  enrollment: ["create", "delete"],
  ...userAc.statements,
});

export const admin = ac.newRole({
  course: ["create", "read", "update", "delete"],
  enrollment: ["create", "delete"],
  ...adminAc.statements,
});
