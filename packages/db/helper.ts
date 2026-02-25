import { timestamp } from "drizzle-orm/pg-core";

// // ── Timestamp helpers ──

export const createdAt = timestamp("created_at").defaultNow().notNull();
export const updatedAt = timestamp("updated_at")
  .defaultNow()
  .$onUpdate(() => /* @__PURE__ */ new Date())
  .notNull();

// // ── Enums ──

// export const courseStatusEnum = pgEnum("course_status", [
//   "draft",
//   "published",
//   "archived",
// ]);

// export const courseDifficultyEnum = pgEnum("course_difficulty", [
//   "beginner",
//   "intermediate",
//   "advanced",
// ]);

// export const lessonTypeEnum = pgEnum("lesson_type", [
//   "video",
//   "article",
//   "quiz",
// ]);

// export const questionTypeEnum = pgEnum("question_type", [
//   "multiple_choice",
//   "multi_select",
//   "true_false",
// ]);

// // Role string constants (single source of truth for seed, auth, and enums)
// export const userRoleEnum = pgEnum("user_role", [
//   "platform_admin",
//   "content_creator",
//   "member",
// ]);

// export const USER_ROLES = {
//   PLATFORM_ADMIN: "platform_admin",
//   CONTENT_CREATOR: "content_creator",
//   MEMBER: "member",
// } as const;

// export const orgRoleEnum = pgEnum("org_role", [
//   "org_owner",
//   "org_admin",
//   "teacher",
//   "student",
//   "org_auditor",
// ]);

// export const ORG_ROLES = {
//   ORG_OWNER: "org_owner",
//   ORG_ADMIN: "org_admin",
//   TEACHER: "teacher",
//   STUDENT: "student",
//   ORG_AUDITOR: "org_auditor",
// } as const;

// export const cohortRoleEnum = pgEnum("cohort_role", ["teacher", "student"]);

// export const COHORT_ROLES = {
//   TEACHER: "teacher",
//   STUDENT: "student",
// } as const;

// // ── JSONB types ──

// export interface VideoMetadata {
//   durationSeconds?: number;
//   provider?: string;
//   thumbnailUrl?: string;
//   url: string;
// }

// export interface ArticleMetadata {
//   content: string;
//   estimatedReadMinutes?: number;
// }

// export interface QuizMetadata {
//   maxAttempts?: number;
//   passingScore: number;
//   shuffleQuestions?: boolean;
//   timeLimitSeconds?: number;
// }

// export interface QuestionMetadata {
//   explanation?: string;
//   hint?: string;
// }

// // ── Custom errors ──

// export class DatabaseError extends Error {
//   code: string;

//   constructor(message: string, code: string) {
//     super(message);
//     this.name = "DatabaseError";
//     this.code = code;
//   }
// }

// export class NotFoundError extends DatabaseError {
//   constructor(message = "Resource not found") {
//     super(message, "NOT_FOUND");
//     this.name = "NotFoundError";
//   }
// }

// export class UnauthorizedError extends DatabaseError {
//   constructor(message = "Unauthorized") {
//     super(message, "UNAUTHORIZED");
//     this.name = "UnauthorizedError";
//   }
// }

// export class ValidationError extends DatabaseError {
//   constructor(message = "Validation failed") {
//     super(message, "VALIDATION_ERROR");
//     this.name = "ValidationError";
//   }
// }
