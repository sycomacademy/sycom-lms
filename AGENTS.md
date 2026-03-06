# AGENTS.md
Guidance for coding agents working in `sycom-lms`.
Follow this file first, then project/tooling feedback.

## Project Snapshot
- Runtime/package manager: Bun
- Framework: Next.js 16 App Router + React 19 + TypeScript (strict)
- Styling/UI: Tailwind CSS v4, shadcn/ui built on Base UI primitives
- API/data: tRPC + TanStack Query + Drizzle ORM + Neon Postgres
- Auth: Better Auth
- Validation: Zod
- Lint/format: Biome via Ultracite
- Git hooks: Lefthook

## Repository Layout (high signal)
- `app/`: Next.js routes (RSC by default), layouts, API routes
- `components/`: UI composition and feature components
- `components/ui/`: base UI primitives (treat as protected)
- `packages/db/`: Drizzle schema, migrations, DB helpers
- `packages/trpc/`: tRPC server/client setup
- `packages/auth/`: Better Auth configuration/helpers
- `packages/env/`: typed env validation for server/client
- `packages/utils/`: shared utils, schemas, logger

## Setup and Core Commands
Run from repo root:

```bash
bun install
bun run prep
```

`prep` installs Git hooks.

## Build / Lint / Typecheck / Test Commands
### Day-to-day
- Dev server: `bun run dev`
- Production build: `bun run build`
- Start built app: `bun run start`
- Full lint/format check (no writes): `bun run check`
- Auto-fix lint/format issues: `bun run fix`
- Type check only: `bun run typecheck`

### Targeted linting/formatting
- Single file fix: `bunx biome check --write path/to/file.tsx`
- Whole repo check (Biome): `bunx biome check .`

### Tests (especially single-test commands)
There is currently no dedicated test script in `package.json` and no committed `*.test.*`/`*.spec.*` files.
When tests are added, use Bun test runner patterns:
- Run all tests: `bun test`
- Run a single test file: `bun test path/to/file.test.ts`
- Run a single test by name: `bun test --test-name-pattern="name fragment" path/to/file.test.ts`
- Watch mode: `bun test --watch`
- If Vitest/Jest/Playwright is introduced later, prefer project scripts over raw commands.

### DB and email tooling
- Generate migrations: `bun run db:generate`
- Apply migrations: `bun run db:migrate`
- Push schema (dev utility): `bun run db:push`
- Open DB studio: `bun run db:studio`
- Seed DB: `bun run db:seed`
- Email template dev server: `bun run email:dev`

## Hook Behavior
`lefthook.yml` defines:
- `pre-push`: `bun x ultracite fix` and `bun x tsc --noEmit`
- `post-checkout`: `bash scripts/switch-db-branch.sh`

Agent expectation: run `bun run fix` and `bun run typecheck` before finishing substantial changes.

## Code Style and Conventions
### Formatting
- Biome is the source of truth.
- Indentation: 2 spaces.
- Use semicolons and double quotes.
- Let Biome organize imports automatically.
- Keep diffs minimal; avoid unrelated reformatting.

### Imports
- Use path alias `@/*` for internal imports.
- Prefer `import type` for type-only imports.
- Group imports logically: third-party, aliases, then local relatives.
- Remove unused imports/variables (warnings are enabled).

### TypeScript
- `strict: true`; do not weaken compiler settings.
- Prefer explicit Zod schemas for external input validation.
- Avoid `any`; if unavoidable, confine/document it.
- Non-null assertions are discouraged (`noNonNullAssertion` warning).
- Export shared input/output types derived from schemas (`z.infer`).

### Naming
- Components: PascalCase (`SignInForm`).
- Hooks: `useXxx`; hook files use kebab-case (for example, `use-mobile.ts`).
- Utility/module files: kebab-case where possible.
- Variables/functions: camelCase.
- Constants: UPPER_SNAKE_CASE only for true constants.

### React / Next.js
- Default to Server Components; add `"use client"` only when needed.
- Keep client boundaries narrow.
- Follow App Router conventions (`page.tsx`, `layout.tsx`, route handlers).
- Keep route and API typing aligned with existing typed patterns.

### UI / Tailwind Rules (Cursor-derived)
- Use design tokens from `app/globals.css` (`bg-background`, `text-foreground`, etc.).
- Do not use arbitrary Tailwind values like `p-[13px]` or `bg-[#fff]`.
- Do not use Sonner; use `toastManager`/`anchoredToastManager` from `components/ui/toast`.
- Use Base UI API (`render` prop), not Radix `asChild`.
- For button-as-link, use `nativeButton={false}` with `render={<Link ... />}`.
- Accordion defaults to single expansion; set `multiple` only when needed.
- `ResizablePanelGroup` uses `orientation`, not `direction`.

### `components/ui/` Protection
- Do not edit files under `components/ui/` unless explicitly requested.
- Prefer wrappers/composition in feature components.

### Data / DB Conventions (Cursor-derived)
- Use query-layer functions for DB access; avoid ad-hoc DB calls in routes/components.
- Reuse helpers in `packages/db/helper.ts` before duplicating schema utilities.
- After schema changes, run generate then migrate (do not rely only on `db:push`).
- When adding a new table, export it in `packages/db/schema/index.ts`.

### Error Handling and Logging
- Throw typed/auth-aware errors where appropriate (`TRPCError`, `APIError`).
- Surface actionable error messages; do not silently swallow failures.
- For server observability, use `createLoggerWithContext` from `packages/utils/logger`.
- In forms/mutations, handle expected failures and show user-facing toasts.

## Agent Workflow Checklist
Before finishing a task, run:
1. `bun run fix`
2. `bun run typecheck`
3. `bun run build` (for larger UI/routing/config changes)

If tests exist for changed code, run targeted tests first, then broader suites.

## Cursor and Copilot Rules Status
Detected Cursor rules:
- `.cursor/rules/guardrails.mdc`
- `.cursor/rules/ui-components.mdc`
- `.cursor/rules/db-conventions.mdc`
- `.cursor/rules/git-conventions.mdc`

No Copilot instruction file was found at `.github/copilot-instructions.md`.

## Git Conventions (from Cursor rules)
- Branch prefixes: `feature/`, `fix/`, `refactor/`, `docs/`, `other/`
- Commit format: `<type> - <description>`
- Use lowercase, concise, present-tense descriptions.

## Cursor Cloud specific instructions

### Environment overview
- **Runtime**: Bun (installed to `~/.bun/bin`; ensure `PATH` includes it).
- **Node**: System Node (v22+) is present via nvm but Bun is the primary runtime.
- All required secrets are injected as environment variables. A `.env.local` is generated at setup time from these vars so Next.js picks them up.

### Starting the dev server
- `bun run dev` starts Next.js on port 3000.
- `bun run dev:all` starts both Next.js and `trigger dev` concurrently (only needed when working on background jobs).
- The app validates env vars at startup via `@t3-oss/env-nextjs`; if any required var is missing, the build/dev command will fail with a clear error naming the missing var.

### Lefthook / Git hooks
- `core.hooksPath` is set by the Cloud Agent environment. Use `bun x lefthook install --force` instead of `bun run prep` to install hooks into the existing hooks path.

### Key gotchas
- **No `.env.example`**: the repo has no `.env.example` file. Required env vars are defined in `packages/env/server.ts` and `packages/env/client.ts`.
- **No test suite yet**: there are no `*.test.*` or `*.spec.*` files. `bun test` will find nothing. Lint (`bun run check`) and typecheck (`bun run typecheck`) are the primary quality gates.
- **DB is remote (Neon)**: there is no local Postgres; all DB operations go through the `DATABASE_URL` pointing at Neon serverless Postgres. Ensure the secret is set.
- **Trigger.dev is optional for basic dev**: the dev server starts fine without `bunx trigger dev` running; background job execution just won't fire locally.
