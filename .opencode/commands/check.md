---
description: Run fix, typecheck, and build to validate the project
agent: build
---

Run the full validation pipeline:
1. `bun run fix` — auto-fix lint/format
2. `bun run typecheck` — check types
3. `bun run build` — verify production build

Report any issues at each step. Stop early if a step fails.
