#!/usr/bin/env bun
/**
 * Seed script: inserts 21 courses with random categories assigned.
 *
 * Usage:
 *   bun run scripts/seed-courses.ts
 *
 * Requires DATABASE_URL in env (e.g. .env or dotenv).
 * Requires at least one admin/instructor user and seeded categories.
 */

import "dotenv/config";
import { inArray } from "drizzle-orm";
import { db } from "../packages/db";
import { user } from "../packages/db/schema/auth";
import {
  category,
  course,
  courseCategory,
  courseInstructor,
} from "../packages/db/schema/course";

const DIFFICULTIES = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;
const STATUSES = ["draft", "published", "archived"] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const COURSES = [
  {
    title: "Introduction to Cybersecurity",
    slug: "intro-cybersecurity",
    description:
      "Learn the fundamentals of cybersecurity including threat landscapes, defense strategies, and security principles.",
  },
  {
    title: "Network Security Essentials",
    slug: "network-security-essentials",
    description:
      "Master firewalls, intrusion detection systems, VPNs, and network segmentation techniques.",
  },
  {
    title: "Ethical Hacking & Penetration Testing",
    slug: "ethical-hacking-pentest",
    description:
      "Hands-on penetration testing methodologies using industry-standard tools and frameworks.",
  },
  {
    title: "Cloud Security Architecture",
    slug: "cloud-security-architecture",
    description:
      "Secure AWS, Azure, and GCP environments with identity management, encryption, and compliance controls.",
  },
  {
    title: "Python for Security Automation",
    slug: "python-security-automation",
    description:
      "Automate security tasks, write custom scanners, and build detection scripts with Python.",
  },
  {
    title: "Incident Response & Forensics",
    slug: "incident-response-forensics",
    description:
      "Develop incident response plans, perform digital forensics, and handle security breaches effectively.",
  },
  {
    title: "Web Application Security",
    slug: "web-app-security",
    description:
      "Identify and remediate OWASP Top 10 vulnerabilities in modern web applications.",
  },
  {
    title: "Cryptography Fundamentals",
    slug: "cryptography-fundamentals",
    description:
      "Understand symmetric and asymmetric encryption, hashing algorithms, and PKI infrastructure.",
  },
  {
    title: "DevSecOps Pipeline Security",
    slug: "devsecops-pipeline",
    description:
      "Integrate security scanning, SAST/DAST, and compliance checks into CI/CD pipelines.",
  },
  {
    title: "Compliance & Governance Frameworks",
    slug: "compliance-governance-frameworks",
    description:
      "Navigate NIST, ISO 27001, SOC 2, GDPR, and HIPAA compliance requirements.",
  },
  {
    title: "Malware Analysis & Reverse Engineering",
    slug: "malware-analysis-reverse-eng",
    description:
      "Analyze malicious software using static and dynamic analysis techniques.",
  },
  {
    title: "Security Operations Center (SOC)",
    slug: "soc-operations",
    description:
      "Build and operate a SOC with SIEM tools, threat hunting, and alert triage workflows.",
  },
  {
    title: "Zero Trust Architecture",
    slug: "zero-trust-architecture",
    description:
      "Design and implement zero trust security models for modern enterprise environments.",
  },
  {
    title: "Mobile Application Security",
    slug: "mobile-app-security",
    description:
      "Secure iOS and Android applications against common mobile threat vectors.",
  },
  {
    title: "Linux System Hardening",
    slug: "linux-system-hardening",
    description:
      "Harden Linux servers with access controls, audit logging, and security configurations.",
  },
  {
    title: "Data Science for Threat Detection",
    slug: "data-science-threat-detection",
    description:
      "Apply machine learning models to detect anomalies, intrusions, and advanced persistent threats.",
  },
  {
    title: "Wireless Network Security",
    slug: "wireless-network-security",
    description:
      "Secure Wi-Fi networks and understand wireless attack vectors and countermeasures.",
  },
  {
    title: "Full-Stack Web Development",
    slug: "fullstack-web-development",
    description:
      "Build modern web applications with React, Node.js, and database integration.",
  },
  {
    title: "Kubernetes Security",
    slug: "kubernetes-security",
    description:
      "Secure container orchestration with pod security policies, RBAC, and network policies.",
  },
  {
    title: "IT Fundamentals for Security",
    slug: "it-fundamentals-security",
    description:
      "Essential IT concepts including networking, operating systems, and infrastructure for aspiring security professionals.",
  },
  {
    title: "Advanced Threat Intelligence",
    slug: "advanced-threat-intelligence",
    description:
      "Collect, analyze, and operationalize threat intelligence to proactively defend against adversaries.",
  },
];

async function main() {
  console.log("Seeding 21 courses...\n");

  // Find an admin or instructor to be the course creator
  const [creator] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(inArray(user.role, ["admin", "instructor"]))
    .limit(1);

  if (!creator) {
    console.error("No admin or instructor user found. Seed users first.");
    process.exit(1);
  }

  console.log(`   Using creator: ${creator.name} (${creator.id})`);

  // Get all categories
  const categories = await db.select().from(category);
  if (categories.length === 0) {
    console.error("No categories found. Run seed-categories.ts first.");
    process.exit(1);
  }

  console.log(`   Found ${categories.length} categories\n`);

  for (const c of COURSES) {
    const difficulty = pick(DIFFICULTIES);
    const status = pick(STATUSES);
    const duration = (Math.floor(Math.random() * 8) + 1) * 30; // 30–240 min

    const [inserted] = await db
      .insert(course)
      .values({
        title: c.title,
        slug: c.slug,
        description: c.description,
        difficulty,
        status,
        estimatedDuration: duration,
        createdBy: creator.id,
      })
      .onConflictDoNothing()
      .returning({ id: course.id });

    if (!inserted) {
      console.log(`   Skipped (already exists): ${c.title}`);
      continue;
    }

    // Add creator as main instructor
    await db.insert(courseInstructor).values({
      courseId: inserted.id,
      userId: creator.id,
      role: "main",
      addedBy: creator.id,
    });

    // Assign 1–3 random categories
    const assignedCategories = pickN(categories, 1, 3);
    if (assignedCategories.length > 0) {
      await db.insert(courseCategory).values(
        assignedCategories.map((cat) => ({
          courseId: inserted.id,
          categoryId: cat.id,
        }))
      );
    }

    console.log(
      `   + ${c.title} [${difficulty}, ${status}, ${assignedCategories.map((c) => c.name).join(", ")}]`
    );
  }

  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
