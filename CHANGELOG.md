# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `packages/db/seed/` folder with all seed scripts: `main.ts` (core data), `lessons.ts` (CISSP/Network+ content), `migrate-images-to-blob.ts` (optional image migration). Single command `bun run db:seed` runs all seeds in order; all seeds are idempotent (safe to run multiple times).

- Drizzle ORM schemas for all entities: `instructor`, `course` (with `course_module`, `course_section`, `course_lesson`, `course_review`), `pathway` (with `pathway_course` junction), `author`, `blog_post`, `faq`, `feature`, `testimonial` in `packages/db/schema/`
- Database migration (`0001_mushy_carmella_unuscione.sql`) creating all new tables in Neon Postgres
- Query functions in `packages/db/queries/` for all entities: `instructor`, `course`, `pathway`, `blog`, `faq`, `feature`, `testimonial`
- `instructor.user_id` FK to `user` table (nullable) for future instructor portal support
- Extracted `CoursesContent` client component from courses page for client-side filtering while keeping data fetching server-side
- Authentication pages with dedicated form components and email sending for password reset and verification
- Ultracite linting and formatting tooling
- Agent rules, skills, and Vercel integration config
- GitHub Actions workflows: Neon workflow and reset-staging workflow in `.github/workflows/`

### Changed

- Seed scripts consolidated into `packages/db/seed/`; `bun run db:seed` now runs main, lessons, and optional image migration; `db:seed:migrate-images` remains for running image migration only.

- All pages (`app/page.tsx`, `app/courses/page.tsx`, `app/courses/[slug]/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/pathway/page.tsx`, `app/pathway/[slug]/page.tsx`) now fetch data from Neon Postgres via Drizzle queries in React Server Components instead of importing from mock-db
- `packages/db/index.ts` updated to export all new schemas
- `generateStaticParams` in dynamic route pages now queries the database for slugs
- Courses listing page refactored: RSC fetches data, passes to client component for filtering
- Updated `README.md` with database section, schema overview, query docs, seed instructions, and image storage recommendations
- Updated `docs/architecture-recommendations.md` with migration status
- Better Auth URL and env configuration for staging/production
- Select component styles: consistent ring properties for focus visibility
- Profile hook added; number field removed from profile

### Removed

- `mock-db/` directory and all mock data files (`courses.ts`, `blog.ts`, `pathways.ts`, `faq.ts`, `features.ts`, `testimonials.ts`, `index.ts`)
