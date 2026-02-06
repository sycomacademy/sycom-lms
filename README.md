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

**DB scripts:** Set `DATABASE_URL` (e.g. from a `.env` in the repo root). For `db:generate` / `db:push` / `db:migrate` / `db:studio` you can run e.g. `dotenv -e .env -- bun run db:generate` if your env is in `.env`.
