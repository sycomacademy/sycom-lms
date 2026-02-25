#!/usr/bin/env bash
# ---------------------------------------------------------
# Manual: switch .env.local DATABASE_URL to the Neon branch
# for the current git branch. Creates the Neon branch from
# staging if it does not exist.
# Run via: bun run db:switch
# ---------------------------------------------------------

set -euo pipefail

NEON_PROJECT_ID="${NEON_PROJECT_ID:-weathered-wildflower-09433160}"
ENV_FILE=".env.local"

# --- Map git branch → Neon branch name ---
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
case "$GIT_BRANCH" in
  main)    NEON_BRANCH="production" ;;
  staging) NEON_BRANCH="staging" ;;
  *)       NEON_BRANCH=$(echo "$GIT_BRANCH" | tr '/' '-') ;;
esac

# --- Check neonctl is installed ---
if ! command -v neonctl &>/dev/null; then
  echo "[db:switch] neonctl not found. Install with: bun add -g neonctl"
  exit 1
fi

# --- Create Neon branch if it doesn't exist ---
if ! neonctl branches get "$NEON_BRANCH" --project-id "$NEON_PROJECT_ID" --output json &>/dev/null; then
  echo "[db:switch] Neon branch '$NEON_BRANCH' does not exist. Creating from staging..."
  neonctl branches create --name "$NEON_BRANCH" --parent staging --project-id "$NEON_PROJECT_ID"
  echo "[db:switch] Created Neon branch '$NEON_BRANCH'."
fi

# --- Get the connection string ---
CONNECTION_STRING=$(neonctl connection-string "$NEON_BRANCH" \
  --project-id "$NEON_PROJECT_ID" \
  --pooled \
  2>/dev/null) || {
  echo "[db:switch] Failed to get connection string for '$NEON_BRANCH'."
  exit 1
}

# --- Update .env.local ---
if [ ! -f "$ENV_FILE" ]; then
  echo "[db:switch] $ENV_FILE not found. Creating with DATABASE_URL only."
  echo "DATABASE_URL='${CONNECTION_STRING}'" > "$ENV_FILE"
else
  TMPFILE=$(mktemp)
  grep -v '^DATABASE_URL=' "$ENV_FILE" > "$TMPFILE" || true
  echo "DATABASE_URL='${CONNECTION_STRING}'" >> "$TMPFILE"
  mv "$TMPFILE" "$ENV_FILE"
fi

echo "[db:switch] Switched to Neon branch '$NEON_BRANCH' (git: $GIT_BRANCH)"
