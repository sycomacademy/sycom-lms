import { timestamp } from "drizzle-orm/pg-core";

// ── Timestamp helpers ──
export const createdAt = timestamp("created_at").defaultNow().notNull();
export const updatedAt = timestamp("updated_at")
  .defaultNow()
  .$onUpdate(() => /* @__PURE__ */ new Date())
  .notNull();

// ── Custom errors ──
export class DatabaseError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "DatabaseError";
    this.code = code;
  }
}

export class NotFoundError extends DatabaseError {
  constructor(message = "Resource not found") {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends DatabaseError {
  constructor(message = "Unauthorized") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends DatabaseError {
  constructor(message = "Validation failed") {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
