#!/usr/bin/env bash
# Cursor beforeShellExecution: enforce Bun over npm/yarn/pnpm (AGENTS.md).
# Input: JSON on stdin with "command". Output: JSON on stdout (permission allow/deny).

set -e
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.command // .tool_input.command // empty')
if [[ -z "$COMMAND" ]]; then
  echo '{"permission":"allow"}'
  exit 0
fi

# Deny npm / yarn / pnpm in favor of bun
if echo "$COMMAND" | grep -qE '^npm\s|^yarn\s|^pnpm\s|\snpm\s|\syarn\s|\spnpm\s'; then
  echo '{"permission":"deny","agentMessage":"This project uses Bun. Use bun instead (e.g. bun install, bun run, bunx). See AGENTS.md."}'
  exit 2
fi

# Deny db:push usage in favor of migration workflow.
if echo "$COMMAND" | grep -qE '(^|[[:space:]])db:push([[:space:]]|$)'; then
  echo '{"permission":"deny","agentMessage":"Do not run db:push directly. Use migration workflow (generate + migrate) per AGENTS.md."}'
  exit 2
fi

echo '{"permission":"allow"}'
exit 0
