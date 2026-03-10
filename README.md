# Sycom LMS

Sycom LMS is a cybersecurity learning platform built for hands-on labs, certification prep, and career-focused training.

## Overview

- Next.js 16 App Router application with React 19 and strict TypeScript
- Bun-based monorepo using tRPC, TanStack Query, Drizzle ORM, and Neon Postgres
- Better Auth for authentication (email/password, OAuth, passkeys, two-factor, SSO)
- Tailwind CSS v4 with shadcn/ui on Base UI primitives
- Trigger.dev for background jobs and React Email for transactional emails
- PostHog for product analytics

## Tech Stack

| Area | Tools |
|------|------|
| Runtime | Bun |
| App framework | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Base UI |
| Data | tRPC, TanStack Query, Drizzle ORM, Neon Postgres |
| Auth | Better Auth |
| Validation / env | Zod, `@t3-oss/env-nextjs` |
| Storage | Cloudinary (media assets) |
| Background jobs | Trigger.dev |
| Email | React Email, Resend |
| Code quality | Biome via Ultracite, Lefthook |
| Analytics | PostHog |

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Install git hooks:

   ```bash
   bun run prep
   ```

3. Create `.env.local` with the values your team uses for local development (see [Environment Notes](#environment-notes)).

4. Point your local app to the correct Neon branch:

   ```bash
   bun run db:neon-switch
   ```

5. Run the app:

   ```bash
   bun run dev
   ```

## Scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start the Next.js development server |
| `bun run dev:all` | Run Next.js and Trigger.dev together |
| `bun run build` | Create a production build |
| `bun run start` | Start the production server |
| `bun run check` | Run Ultracite checks (lint/format) |
| `bun run fix` | Auto-fix formatting and lint issues |
| `bun run typecheck` | Run TypeScript without emitting files |
| `bun run prep` | Install Lefthook hooks |
| `bun run email:dev` | Start the React Email preview server |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply pending Drizzle migrations |
| `bun run db:push` | Push schema changes directly to the database |
| `bun run db:seed` | Seed the database |
| `bun run db:neon-switch` | Switch `.env.local` to the current branch's Neon database |
| `bun run db:neon-merge -- <branch>` | Merge another branch schema into the current Neon branch |
| `bun run trigger:dev` | Start Trigger.dev locally |
| `bun run trigger:deploy` | Deploy Trigger.dev tasks |

To open Drizzle Studio for database inspection:

```bash
bun x drizzle-kit studio --config=packages/db/drizzle.config.ts
```

## Database

The app uses Neon Postgres with Drizzle ORM.

### Schema modules

| File | Main tables / enums |
|------|--------------------|
| `packages/db/schema/auth.ts` | `user`, `session`, `account`, `organization`, `member`, `cohort`, `cohort_member`, `invitation`, `verification`, `passkey`, `twoFactor`, `ssoProvider`, `scimProvider` |
| `packages/db/schema/profile.ts` | `profile` |
| `packages/db/schema/blog.ts` | `blogPost` |
| `packages/db/schema/course.ts` | `course`, `category`, `courseCategory`, `courseInstructor`, `section`, `lesson` |
| `packages/db/schema/enrollment.ts` | `courseAssignment`, `enrollment`, `lessonProgress`, `cohortSectionSettings`, `cohortLessonSettings` |
| `packages/db/schema/entitlement.ts` | `orgCourseEntitlement` |
| `packages/db/schema/feedback.ts` | `feedback`, `report` |
| `packages/db/schema/public-invite.ts` | `publicInvite` |
| `packages/db/schema/storage.ts` | `mediaAsset` |

### Migration workflow

After changing schema files, run:

```bash
bun run db:generate
bun run db:migrate
```

Use `bun run db:push` only for quick development syncs when you do not need migration files.

### Seeding

Seed the database with:

```bash
bun run db:seed
```

## Local Database Branching

This repo mirrors git branches with Neon branches.

- `main` maps to the permanent `production` Neon branch
- `staging` maps to the permanent `staging` Neon branch
- feature and fix branches map to matching temporary Neon branches

Switch your local database connection after changing branches:

```bash
bun run db:neon-switch
```

To bring another branch's schema into your current Neon branch:

```bash
bun run db:neon-merge -- staging
```

## CI and Deployment

- GitHub Actions handles database branch checks, migration validation, and cleanup
- Vercel handles preview and production deployments
- Neon provides branch-based database environments aligned with the git workflow

Typical flow:

```text
feature/* -> staging -> main
```

- Pull requests validate migrations before merge
- Merges into `staging` update the staging database
- Merges into `main` update production

## Environment Notes

Local development usually needs values for:

**Server (required):**

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`, `RESEND_EMAIL_FROM`, `RESEND_EMAIL_REPLY_TO`, `RESEND_EMAIL_UNSUBSCRIBE_SALT`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- `TRIGGER_SECRET_KEY`, `TRIGGER_PROJECT_REF`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Client:**

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_POSTHOG_KEY` (PostHog project API key)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional, defaults to `https://eu.i.posthog.com`)

**Optional:**

- `ROOT_DOMAIN` (defaults to `localhost:3000`)
- `HEALTH_IP_ALLOWLIST` (for health probe IP allowlisting)

Ask your team for current project-specific values.

## Project Structure

| Path | Purpose |
|------|---------|
| `app/` | App Router routes, layouts, and route handlers |
| `components/` | Feature and page-level components |
| `components/ui/` | Shared base UI primitives (shadcn/ui) |
| `packages/db/` | Drizzle schema, queries, migrations, and seeds |
| `packages/trpc/` | tRPC server/client setup |
| `packages/auth/` | Better Auth configuration and helpers |
| `packages/env/` | Typed environment validation (server/client) |
| `packages/utils/` | Shared helpers, schemas, logger |
| `packages/email/` | React Email templates and rendering |
| `packages/storage/` | Cloudinary upload and media queries |
| `packages/analytics/` | PostHog client and server utilities |
| `packages/health/` | Health check probes and registry |
| `packages/hooks/` | Shared React hooks |
| `packages/trigger/` | Trigger.dev tasks |
| `trigger/` | Trigger.dev config (project root) |
| `scripts/` | Branch switching and Neon merge scripts |

## Key Features

- **Organizations & cohorts** — Multi-tenant org model with cohort-based course delivery
- **Course authoring** — Draft/publish courses, sections, lessons (Tiptap-based content)
- **Learning experience** — Enrollment, lesson progress, course assignments
- **Entitlements** — Org-level course access and seat management
- **Public invites** — Token-based sign-up invitations
- **Feedback & reports** — User feedback and admin report tracking
- **Blog** — Content marketing with published/draft posts

## Development Notes

- Prefer `bun run fix` before pushing changes
- Run `bun run typecheck` when you change application logic or types
- Use `bun run build` to verify larger routing or UI changes
- Avoid editing `components/ui/` unless you are intentionally changing shared primitives
- Git hooks (Lefthook): `pre-push` runs Ultracite fix and TypeScript check on staged files
