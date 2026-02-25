#!/usr/bin/env bash
# ---------------------------------------------------------
# Apply another git branch's migrations to the current
# branch's Neon database (schema "merge").
# Run via: bun run db:neon-merge <branch-name>
# If <branch-name> is the same as current branch, exits with error.
# ---------------------------------------------------------

set -euo pipefail

NEON_PROJECT_ID="${NEON_PROJECT_ID:-weathered-wildflower-09433160}"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <branch-name>"
  echo "  Applies that branch's migrations to the current branch's Neon DB."
  exit 1
fi

SOURCE_BRANCH="$1"
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$SOURCE_BRANCH" = "$GIT_BRANCH" ]; then
  echo "[db:neon-merge] Cannot merge Neon branch into itself (source and current branch are both '$GIT_BRANCH')."
  exit 1
fi

# --- Resolve source branch ref ---
if ! git rev-parse --verify "refs/heads/$SOURCE_BRANCH" &>/dev/null; then
  echo "[db:neon-merge] Branch '$SOURCE_BRANCH' not found locally."
  exit 1
fi

# --- Current branch's Neon name and connection string ---
case "$GIT_BRANCH" in
  main)    NEON_BRANCH="production" ;;
  staging) NEON_BRANCH="staging" ;;
  *)       NEON_BRANCH=$(echo "$GIT_BRANCH" | tr '/' '-') ;;
esac

if ! command -v neonctl &>/dev/null; then
  echo "[db:neon-merge] neonctl not found. Install with: bun add -g neonctl"
  exit 1
fi

if ! neonctl branches get "$NEON_BRANCH" --project-id "$NEON_PROJECT_ID" --output json &>/dev/null; then
  echo "[db:neon-merge] Current branch's Neon branch '$NEON_BRANCH' does not exist. Run 'bun run db:switch' first."
  exit 1
fi

TARGET_DATABASE_URL=$(neonctl connection-string "$NEON_BRANCH" --project-id "$NEON_PROJECT_ID" --pooled 2>/dev/null) || {
  echo "[db:neon-merge] Failed to get connection string for '$NEON_BRANCH'."
  exit 1
}

# --- Apply source branch's migrations: temporarily checkout migrations, then run migrate ---
REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"
# Stash local migrations changes if any so we can restore after
git diff --quiet -- "packages/db/migrations" 2>/dev/null || MIGRATIONS_DIRTY=1
[ -n "${MIGRATIONS_DIRTY:-}" ] && git stash push -m "neon-merge-temp" -- "packages/db/migrations" 2>/dev/null || true
git checkout "$SOURCE_BRANCH" -- "packages/db/migrations"
trap 'cd "$REPO_ROOT"; git checkout "$GIT_BRANCH" -- packages/db/migrations; [ -n "${MIGRATIONS_DIRTY:-}" ] && git stash pop 2>/dev/null || true' EXIT

echo "[db:neon-merge] Applying migrations from '$SOURCE_BRANCH' to Neon branch '$NEON_BRANCH'..."
DATABASE_URL="$TARGET_DATABASE_URL" bun run db:migrate

cd "$REPO_ROOT"
git checkout "$GIT_BRANCH" -- packages/db/migrations
[ -n "${MIGRATIONS_DIRTY:-}" ] && git stash pop 2>/dev/null || true
trap - EXIT

echo "[db:neon-merge] Done. Neon branch '$NEON_BRANCH' now has migrations from '$SOURCE_BRANCH' applied."
