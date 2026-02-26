#!/usr/bin/env bash
# Cursor afterFileEdit: enforce deterministic codebase guardrails.

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT_DIR"

FILES=("*.ts" "*.tsx" "*.js" "*.jsx")

# Disallow Radix-style asChild usage.
if git grep -nE "\<asChild\>" -- "${FILES[@]}" >/dev/null; then
  echo "Hook blocked: Found disallowed 'asChild' usage. Use Base UI 'render' prop instead."
  git grep -nE "\<asChild\>" -- "${FILES[@]}" || true
  exit 1
fi

# Disallow Sonner imports/usages.
if git grep -nE "from ['\"]sonner['\"]|import\(['\"]sonner['\"]\)|\<sonner\>" -- "${FILES[@]}" >/dev/null; then
  echo "Hook blocked: Found disallowed Sonner usage. Use components/ui/toast managers instead."
  git grep -nE "from ['\"]sonner['\"]|import\(['\"]sonner['\"]\)|\<sonner\>" -- "${FILES[@]}" || true
  exit 1
fi

exit 0
