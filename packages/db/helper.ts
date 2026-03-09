import { timestamp } from "drizzle-orm/pg-core";

// ── Timestamp helpers ──
export const createdAt = timestamp("created_at").defaultNow().notNull();
export const updatedAt = timestamp("updated_at")
  .defaultNow()
  .$onUpdate(() => /* @__PURE__ */ new Date())
  .notNull();

// ── Constants ──
export const PUBLIC_ORG_SLUG = "platform";
export const PUBLIC_ORG_NAME = "Platform";
export const PUBLIC_COHORT_NAME = "General";
export const CATEGORIES = [
  { name: "Cybersecurity", slug: "cybersecurity", order: 1 },
  { name: "Network Security", slug: "network-security", order: 2 },
  { name: "Cloud Computing", slug: "cloud-computing", order: 3 },
  { name: "Programming", slug: "programming", order: 4 },
  { name: "Data Science", slug: "data-science", order: 5 },
  { name: "DevOps", slug: "devops", order: 6 },
  { name: "IT Fundamentals", slug: "it-fundamentals", order: 7 },
  {
    name: "Compliance & Governance",
    slug: "compliance-governance",
    order: 8,
  },
  { name: "Web Development", slug: "web-development", order: 9 },
  { name: "Ethical Hacking", slug: "ethical-hacking", order: 10 },
  { name: "Incident Response", slug: "incident-response", order: 11 },
  { name: "Cryptography", slug: "cryptography", order: 12 },
] as const;

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
