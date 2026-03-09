# Sycom LMS

Sycom LMS is a cybersecurity learning platform built for hands-on labs, certification prep, and career-focused training.

## Overview

- Next.js 16 App Router application with React 19 and strict TypeScript
- Bun-based monorepo using tRPC, TanStack Query, Drizzle ORM, and Neon Postgres
- Better Auth for authentication and Tailwind CSS v4 with shadcn/ui on Base UI primitives
- Trigger.dev support for background jobs and React Email templates for email workflows

## Tech Stack

| Area | Tools |
|---|---|
| Runtime | Bun |
| App framework | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui, Base UI |
| Data | tRPC, TanStack Query, Drizzle ORM, Neon Postgres |
| Auth | Better Auth |
| Validation / env | Zod, `@t3-oss/env-nextjs` |
| Background jobs | Trigger.dev |
| Email | React Email, Resend |
| Code quality | Biome via Ultracite, Lefthook |
| Analytics / product tooling | PostHog |

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Install git hooks:

   ```bash
   bun run prep
   ```

3. Create `.env.local` with the values your team uses for local development.

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
|---|---|
| `bun run dev` | Start the Next.js development server |
| `bun run dev:all` | Run Next.js and Trigger.dev together |
| `bun run build` | Create a production build |
| `bun run start` | Start the production server |
| `bun run check` | Run Ultracite checks |
| `bun run fix` | Auto-fix formatting and lint issues |
| `bun run typecheck` | Run TypeScript without emitting files |
| `bun run prep` | Install Lefthook hooks |
| `bun run email:dev` | Start the React Email preview server |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply pending Drizzle migrations |
| `bun run db:push` | Push schema changes directly to the database |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed the database |
| `bun run db:seed:programme` | Run the programme seed only |
| `bun run db:neon-switch` | Switch `.env.local` to the current branch's Neon database |
| `bun run db:neon-merge -- <branch>` | Merge another branch schema into the current Neon branch |
| `bun run trigger:dev` | Start Trigger.dev locally |
| `bun run trigger:deploy` | Deploy Trigger.dev tasks |

## Database

The app uses Neon Postgres with Drizzle ORM.

### Schema modules

| File | Main tables |
|---|---|
| `packages/db/schema/auth.ts` | `user`, `session`, `account`, `verification` |
| `packages/db/schema/profile.ts` | `profile` |
| `packages/db/schema/instructor.ts` | `instructor` |
| `packages/db/schema/course.ts` | `course`, `course_module`, `course_section`, `course_lesson`, `course_review` |
| `packages/db/schema/pathway.ts` | `pathway`, `pathway_course` |
| `packages/db/schema/blog.ts` | `author`, `blog_post` |
| `packages/db/schema/faq.ts` | `faq` |
| `packages/db/schema/feature.ts` | `feature` |
| `packages/db/schema/testimonial.ts` | `testimonial` |

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

There is also a targeted programme seed:

```bash
bun run db:seed:programme
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

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `BLOB_READ_WRITE_TOKEN` when using blob-backed asset workflows

Ask your team for current project-specific values.

## Project Structure

| Path | Purpose |
|---|---|
| `app/` | App Router routes, layouts, and route handlers |
| `components/` | Feature and page-level components |
| `components/ui/` | Shared base UI primitives |
| `packages/db/` | Drizzle schema, queries, migrations, and seeds |
| `packages/trpc/` | tRPC setup |
| `packages/auth/` | Better Auth configuration |
| `packages/env/` | Environment validation |
| `packages/utils/` | Shared helpers and utilities |
| `trigger/` | Trigger.dev tasks |

## Development Notes

- Prefer `bun run fix` before pushing changes
- Run `bun run typecheck` when you change application logic or types
- Use `bun run build` to verify larger routing or UI changes
- Avoid editing `components/ui/` unless you are intentionally changing shared primitives
