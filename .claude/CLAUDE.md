# CLAUDE.md

Guidance for Claude Code working in `sycom-lms`.

## Project Snapshot

- Runtime/package manager: Bun
- Framework: Next.js 16 App Router + React 19 + TypeScript (strict)
- Styling/UI: Tailwind CSS v4, shadcn/ui built on Base UI primitives
- API/data: tRPC + TanStack Query + Drizzle ORM + Neon Postgres
- Auth: Better Auth
- Validation: Zod
- Lint/format: Biome via Ultracite
- Git hooks: Lefthook

## Repository Layout

- `app/`: Next.js routes (RSC by default), layouts, API routes
- `components/`: UI composition and feature components
- `components/ui/`: base UI primitives (treat as protected)
- `packages/db/`: Drizzle schema, migrations, DB helpers
- `packages/trpc/`: tRPC server/client setup
- `packages/auth/`: Better Auth configuration/helpers
- `packages/env/`: typed env validation for server/client
- `packages/utils/`: shared utils, schemas, logger

## Core Commands

```bash
bun install          # install deps
bun run prep         # install git hooks
bun run dev          # dev server
bun run build        # production build
bun run check        # lint/format check (no writes)
bun run fix          # auto-fix lint/format
bun run typecheck    # type check only
```

### DB Commands

```bash
bun run db:generate  # generate migrations
bun run db:migrate   # apply migrations
bun run db:push      # push schema (dev only)
bun run db:studio    # open DB studio
bun run db:seed      # seed DB
```

### Single File Lint

```bash
bunx biome check --write path/to/file.tsx
```

## Agent Workflow

Before finishing a task:

1. `bun run fix`
2. `bun run typecheck`
3. `bun run build` (for larger UI/routing/config changes)

## Code Style

- Biome is the source of truth for formatting
- 2 spaces, semicolons, double quotes
- Use `@/*` path alias for internal imports
- Prefer `import type` for type-only imports
- `strict: true` TypeScript — avoid `any`
- Components: PascalCase. Hooks: `useXxx`. Files: kebab-case. Variables: camelCase

## React / Next.js

- Default to Server Components; add `"use client"` only when needed
- Keep client boundaries narrow
- Follow App Router conventions (`page.tsx`, `layout.tsx`, route handlers)

## UI Rules

- Use design tokens from `app/globals.css` — no arbitrary Tailwind values (`p-[13px]`, `bg-[#fff]`)
- Use Base UI API (`render` prop), not Radix `asChild`
- For button-as-link: `nativeButton={false}` with `render={<Link ... />}`
- Accordion defaults to single expansion; `ResizablePanelGroup` uses `orientation` not `direction`
- Do not use Sonner — use `toastManager`/`anchoredToastManager` from `components/ui/toast`

## components/ui/ Protection

- Do not edit files under `components/ui/` unless explicitly requested
- Prefer wrappers/composition in feature components
- If a change requires editing a base component, ask first

## DB Conventions

- Use query-layer functions for DB access — no ad-hoc DB calls in routes/components
- Reuse helpers in `packages/db/helper.ts`
- After schema changes: generate then migrate (don't rely only on `db:push`)
- When adding a new table, export it in `packages/db/schema/index.ts`

## Git Conventions

- Branch prefixes: `feature/`, `fix/`, `refactor/`, `docs/`, `other/`
- Commit format: `<type> - <description>`
- Lowercase, concise, present-tense descriptions

## Error Handling

- Throw typed errors (`TRPCError`, `APIError`)
- Use `createLoggerWithContext` from `packages/utils/logger` for server observability
- Handle expected failures in forms/mutations with user-facing toasts
