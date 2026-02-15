import { z } from "zod";

// Input schemas
export const listUsersSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.enum(["name", "email", "createdAt"]).default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  filterRole: z.enum(["admin", "instructor", "student"]).optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["admin", "instructor", "student"]).default("student"),
});

export const banUserSchema = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(), // seconds
});

export const setRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["admin", "instructor", "student"]),
});

export const listReportsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  type: z.enum(["report", "feedback", "all"]).default("all"),
  status: z
    .enum(["pending", "in_progress", "resolved", "closed", "all"])
    .default("all"),
});

export const updateReportStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "in_progress", "resolved", "closed"]),
});
