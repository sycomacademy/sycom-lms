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
- sendgrid

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

| `bun run db:seed` | Seed the database with initial data | After running migrations on a fresh DB |

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

Run `bun run db:seed` to populate the database with initial data. The seed script is idempotent (uses `ON CONFLICT DO NOTHING`).

### Migrations

```bash
# After schema changes
bun run db:generate   # Generate migration SQL
bun run db:migrate    # Apply to the database
```

## Image / file storage

Image and video URLs are stored as `text` columns in the database. Actual files are served from the `/public/images/` directory during development.

For production, we recommend one of:

- **Vercel Blob** — Simplest if deploying on Vercel
- **Cloudflare R2** — S3-compatible, zero egress fees
- **AWS S3** — Industry standard

When ready, create a `packages/storage/` module that handles uploads and returns public URLs to store in the database.
