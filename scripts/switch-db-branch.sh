#!/usr/bin/env bash
# ---------------------------------------------------------
# post-checkout hook: update .env.local DATABASE_URL to
# match the Neon branch for the current git branch.
# ---------------------------------------------------------

set -euo pipefail

NEON_PROJECT_ID="weathered-wildflower-09433160"
ENV_FILE=".env.local"

# --- Map git branch → Neon branch name ---
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

case "$GIT_BRANCH" in
  main)       NEON_BRANCH="production" ;;
  staging)    NEON_BRANCH="staging" ;;
  *)          NEON_BRANCH=$(echo "$GIT_BRANCH" | tr '/' '-') ;;
esac

# --- Check neonctl is installed ---
if ! command -v neonctl &>/dev/null; then
  echo "[db-switch] neonctl not found. Install with: bun add -g neonctl"
  exit 0
fi

# --- Check the Neon branch exists ---
if ! neonctl branches get "$NEON_BRANCH" --project-id "$NEON_PROJECT_ID" --output json &>/dev/null; then
  echo "[db-switch] Neon branch '$NEON_BRANCH' does not exist yet."
  echo "[db-switch] It will be created when you push. Using current DATABASE_URL."
  exit 0
fi

# --- Get the connection string ---
CONNECTION_STRING=$(neonctl connection-string "$NEON_BRANCH" \
  --project-id "$NEON_PROJECT_ID" \
  --pooled \
  2>/dev/null) || {
  echo "[db-switch] Failed to get connection string for '$NEON_BRANCH'."
  exit 0
}

# --- Update .env.local ---
if [ ! -f "$ENV_FILE" ]; then
  echo "[db-switch] $ENV_FILE not found. Skipping."
  exit 0
fi

# Rewrite .env.local: keep all lines except DATABASE_URL, then append the new one
TMPFILE=$(mktemp)
grep -v '^DATABASE_URL=' "$ENV_FILE" > "$TMPFILE" || true
echo "DATABASE_URL='${CONNECTION_STRING}'" >> "$TMPFILE"
mv "$TMPFILE" "$ENV_FILE"

echo "[db-switch] Switched to Neon branch '$NEON_BRANCH' (git: $GIT_BRANCH)"
