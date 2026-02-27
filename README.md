# Sycom LMS

Learn cybersecurity with hands-on labs, certification prep, and career-focused training.

## Tech stack

- **Runtime / package manager**: Bun
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI)
- **Data / API**: TanStack Query, tRPC, Neon (Postgres), Drizzle ORM
- **Auth**: Better Auth
- **Env**: T3 Env (`@t3-oss/env-nextjs`)
- **AI**: Vercel AI SDK, Anthropic
- **Code quality**: Biome (via Ultracite), Lefthook
- **Email**: Resend (sendgrid for backup)
- **CI**: GitHub Actions (Neon workflow, reset-staging)

## Scripts

| Script | What it does | When to run |
|--------|----------------|-------------|
| `bun dev` | Start the Next.js dev server | Local development |
| `bun build` | Production build | Before deploy or to verify build |
| `bun start` | Run the production server | After `bun build` (e.g. locally or in prod) |
| `bun lint` | Run Biome lint check | On demand or in CI |
| `bun format` | Format with Biome | On demand |
| `bun check` | Ultracite check (lint + format) | On demand |
| `bun fix` | Ultracite fix (auto-fix and format) | Before committing; also runs on pre-commit via Lefthook |
| `bun typecheck` | TypeScript check only | CI or when verifying types |
| `bun run db:generate` | Generate Drizzle migrations from schema changes | After changing any schema in `packages/db/schema` |
| `bun run db:push` | Push schema to the DB (no migration files) | Once when setting up the DB, or for quick local sync (dev only) |
| `bun run db:migrate` | Apply pending migrations | After pulling new migrations or in deployment |
| `bun run db:studio` | Open Drizzle Studio UI | When you need to inspect or edit data |
| `bun prepare` | Install Lefthook git hooks | Once after clone (or when adding the repo) |
| `bun run db:seed` | Seed the database (main + lessons + optional image migration) | After running migrations on a fresh DB |

**DB scripts:** Set `DATABASE_URL` (e.g. from a `.env` in the repo root). For `db:generate` / `db:push` / `db:migrate` / `db:studio` you can run e.g. `dotenv -e .env -- bun run db:generate` if your env is in `.env`.

## Database

All application data is stored in **Neon Postgres** and managed via **Drizzle ORM**.

### Schema overview

| Schema file | Tables |
|---|---|
| `packages/db/schema/auth.ts` | `user`, `session`, `account`, `verification` (Better Auth) |
| `packages/db/schema/profile.ts` | `profile` |
| `packages/db/schema/instructor.ts` | `instructor` (with optional `user_id` FK to `user` for instructor portal) |
| `packages/db/schema/course.ts` | `course`, `course_module`, `course_section`, `course_lesson`, `course_review` |
| `packages/db/schema/pathway.ts` | `pathway`, `pathway_course` (many-to-many junction) |
| `packages/db/schema/blog.ts` | `author`, `blog_post` |
| `packages/db/schema/faq.ts` | `faq` |
| `packages/db/schema/feature.ts` | `feature` |
| `packages/db/schema/testimonial.ts` | `testimonial` (optional `course_id`, `pathway_id`) |

### Query functions

All query functions live in `packages/db/queries/` and are used directly in React Server Components for zero-waterfall data fetching. Key queries include:

- **Courses**: `getAllCourses`, `getCourseBySlug`, `getFeaturedCourses`, `getCourseWithModules`, `getCoursesByInstructorId`
- **Pathways**: `getAllPathways`, `getPathwayBySlug`, `getCoursesForPathway`
- **Blog**: `getAllBlogPosts`, `getBlogPostBySlug`, `getRelatedPosts`
- **Instructors**: `getAllInstructors`, `getInstructorById`, `getInstructorByUserId`
- **Static content**: `getAllFaqs`, `getAllFeatures`, `getAllTestimonials`

### Seeding

Run `bun run db:seed` to populate the database. This runs all seeds in `packages/db/seed/`:

1. **main** — instructors, courses, pathways, authors, blog posts, FAQs, features, testimonials
2. **lessons** — CISSP and Network+ course content, quiz questions
3. **migrate-images** — uploads `public/images/` to Vercel Blob and updates DB (skipped if `BLOB_READ_WRITE_TOKEN` is not set)

All seeds are **idempotent**: safe to run multiple times (uses `ON CONFLICT DO NOTHING` and conditional updates).

To run only the image migration: `bun run db:seed:migrate-images` (requires `BLOB_READ_WRITE_TOKEN`).

### Migrations

```bash
# After schema changes
bun run db:generate   # Generate migration SQL
bun run db:migrate    # Apply to the database
```

## CI/CD Pipeline

### Overview

The project uses three platforms working together:

- **GitHub Actions** — Automates Neon database branch lifecycle and migrations
- **Vercel** — Builds and deploys the app (Production from `main`, Preview from `staging` and feature branches)
- **Neon** — Database branching mirrors the git branching model

### Git branching model

```
feature/new-login ──► staging ──► main
       │                 │           │
   Neon: feature-new-login   Neon: staging   Neon: production
```

| Git branch | Neon branch | Vercel environment | Lifecycle |
|---|---|---|---|
| `main` | `production` | Production | Permanent |
| `staging` | `staging` | Preview | Permanent |
| `feature/*`, `fix/*`, etc. | `feature-*`, `fix-*`, etc. | Preview | Created/deleted automatically |

### What happens automatically (PR-only workflow)

| Event | GitHub Action | Neon |
|---|---|---|
| PR opened / updated | Creates temp Neon branches, runs `db:generate` + `db:migrate` for head and target schema, checks head migrations apply cleanly to target → pass/fail; then deletes temp branches | Temp branches only |
| PR merged into `staging` | Runs `db:generate` + `db:migrate` against staging DB | Schema updated |
| PR merged into `main` | Runs `db:generate` + `db:migrate` against production DB | Schema updated |
| PR closed | Deletes temp branches `pr-<number>-head` and `pr-<number>-compat` | Cleanup |

Neon branches for feature branches are **not** created by the workflow; create them locally with `bun run db:switch` when on that branch.

### Local database switching (manual)

Switch `.env.local` to the Neon branch for your current git branch and create the Neon branch if it doesn’t exist:

```bash
bun run db:switch
```

Examples:

```bash
git checkout staging
bun run db:switch   # .env.local → Neon "staging"
git checkout feature/new-login
bun run db:switch   # Creates Neon "feature-new-login" from staging if needed, updates .env.local
git checkout main
bun run db:switch   # .env.local → Neon "production"
```

To apply another branch’s migrations to your current branch’s Neon DB (e.g. bring in `staging`’s schema):

```bash
bun run db:neon-merge -- staging
```

You cannot merge a branch into itself; the script exits with an error in that case.

### Setup for new developers

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url> && cd sycom-lms
   bun install
   ```

2. **Install the Neon CLI**

   ```bash
   bun add -g neonctl
   ```

3. **Authenticate with Neon** (opens browser)

   ```bash
   neonctl auth
   ```

4. **Create your `.env.local`** with the required variables:

   ```
   DATABASE_URL='<run `bun run db:switch` to set from Neon>'
   BETTER_AUTH_SECRET='<ask a team member or generate with: openssl rand -base64 32>'
   GOOGLE_CLIENT_ID='<from Google Cloud OAuth credentials>'
   GOOGLE_CLIENT_SECRET='<from Google Cloud OAuth credentials>'
   BLOB_READ_WRITE_TOKEN='<from Vercel dashboard → Storage>'
   NEXT_PUBLIC_APP_URL='http://localhost:3000'
   ```

   For Google OAuth, configure this redirect URI in Google Cloud Console:
   `http://localhost:3000/api/auth/callback/google`

5. **Install git hooks**

   ```bash
   bun run prep
   ```

   This registers the `pre-push` (lint + typecheck) hook.

6. **Point `.env.local` at your branch’s Neon DB:**

   ```bash
   bun run db:switch
   ```

### Required GitHub secrets and variables

Configured in **GitHub → Repo → Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|---|---|---|
| Secret | `NEON_API_KEY` | Neon API key |
| Secret | `DATABASE_URL_MAIN` | Pooled connection string for the `production` Neon branch |
| Secret | `DATABASE_URL_STAGING` | Pooled connection string for the `staging` Neon branch |
| Variable | `NEON_PROJECT_ID` | Neon project ID |

### Vercel environment variables

| Variable | Production | Preview |
|---|---|---|
| `DATABASE_URL` | Production Neon connection string | Staging Neon connection string |
| `BETTER_AUTH_SECRET` | Production secret | Staging secret |
| `GOOGLE_CLIENT_ID` | OAuth client ID | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | OAuth client secret |
| `NEXT_PUBLIC_APP_URL` | Production URL | Staging/preview URL |
| `BLOB_READ_WRITE_TOKEN` | All environments | All environments |

## Image / file storage

Image and video URLs are stored as `text` columns in the database. Actual files are served from the `/public/images/` directory during development.

For production, we recommend one of:

- **Vercel Blob** — Simplest if deploying on Vercel
- **Cloudflare R2** — S3-compatible, zero egress fees
- **AWS S3** — Industry standard

When ready, create a `packages/storage/` module that handles uploads and returns public URLs to store in the database.
