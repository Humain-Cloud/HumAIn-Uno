#!/usr/bin/env bash
#
# setup-supabase.sh — Check and apply the Supabase database migration
#
# This script:
#   1. Checks if the migration has already been applied (via the Supabase REST API)
#   2. If not applied, runs the Node.js migration script
#   3. Prints clear instructions if the DB password is not available
#
# Usage:
#   ./scripts/setup-supabase.sh                 # uses SUPABASE_DB_PASSWORD env var
#   ./scripts/setup-supabase.sh <DB_PASSWORD>   # passes password to migration script
#
# Environment variables (optional):
#   SUPABASE_DB_PASSWORD  — Database password (or pass as first argument)
#   SUPABASE_URL          — Project URL (default: https://iwjjiddydmnpjdzwlckn.supabase.co)
#   SUPABASE_ANON_KEY     — Anon/public key for REST API check
#

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_SCRIPT="$SCRIPT_DIR/migrate-supabase.js"
MIGRATION_SQL="$PROJECT_ROOT/supabase/migrations/001_initial_auth_schema.sql"

SUPABASE_URL="${SUPABASE_URL:-https://iwjjiddydmnpjdzwlckn.supabase.co}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"

# Color codes
RED='\033[31m'
GREEN='\033[32m'
CYAN='\033[36m'
YELLOW='\033[33m'
BOLD='\033[1m'
RESET='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()    { echo -e "${CYAN}→${RESET} $*"; }
success() { echo -e "${GREEN}✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}⚠${RESET} $*"; }
error()   { echo -e "${RED}✖${RESET} $*"; }

# ---------------------------------------------------------------------------
# Step 1: Check if migration is already applied
# ---------------------------------------------------------------------------
check_migration_via_rest() {
  # Try to query the profiles table through the Supabase REST API
  # If the table exists we'll get a 200 (even with an empty array).
  # If the table doesn't exist we'll get a 404 or an error.

  if [ -z "$SUPABASE_ANON_KEY" ]; then
    warn "SUPABASE_ANON_KEY not set — skipping REST API pre-check."
    warn "Will attempt migration directly."
    return 1  # "not applied" — proceed with migration
  fi

  info "Checking if migration is already applied via REST API..."

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    "${SUPABASE_URL}/rest/v1/profiles?select=id&limit=1" \
    2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "200" ]; then
    success "profiles table is accessible — migration already applied."
    return 0  # "already applied"
  elif [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "000" ]; then
    info "profiles table not found or unreachable — migration needed."
    return 1
  else
    warn "Unexpected HTTP status $HTTP_CODE when checking profiles table."
    warn "Proceeding with migration attempt..."
    return 1
  fi
}

# ---------------------------------------------------------------------------
# Step 2: Get the password
# ---------------------------------------------------------------------------
get_password() {
  # Command-line argument takes priority, then env variable
  if [ $# -ge 1 ] && [ -n "$1" ]; then
    echo "$1"
    return
  fi
  if [ -n "${SUPABASE_DB_PASSWORD:-}" ]; then
    echo "$SUPABASE_DB_PASSWORD"
    return
  fi
  echo ""
}

# ---------------------------------------------------------------------------
# Step 3: Run the migration
# ---------------------------------------------------------------------------
run_migration() {
  local password="$1"

  if [ ! -f "$MIGRATION_SCRIPT" ]; then
    error "Migration script not found: $MIGRATION_SCRIPT"
    exit 1
  fi

  if [ ! -f "$MIGRATION_SQL" ]; then
    error "Migration SQL not found: $MIGRATION_SQL"
    exit 1
  fi

  info "Running migration script..."
  node "$MIGRATION_SCRIPT" "$password"
}

# ---------------------------------------------------------------------------
# Print instructions when no password is available
# ---------------------------------------------------------------------------
print_instructions() {
  echo ""
  echo -e "${BOLD}============================================================${RESET}"
  echo -e "${BOLD}  Supabase Database Setup — Instructions${RESET}"
  echo -e "${BOLD}============================================================${RESET}"
  echo ""
  echo "  To set up your Supabase database you need the database password."
  echo ""
  echo "  Find it at:"
  echo "    Supabase Dashboard → Settings → Database → Database password"
  echo ""
  echo "  Then run one of:"
  echo ""
  echo "    ./scripts/setup-supabase.sh <YOUR_DB_PASSWORD>"
  echo ""
  echo "    SUPABASE_DB_PASSWORD=<YOUR_DB_PASSWORD> ./scripts/setup-supabase.sh"
  echo ""
  echo "  Or run the migration script directly:"
  echo ""
  echo "    node scripts/migrate-supabase.js <YOUR_DB_PASSWORD>"
  echo ""
  echo "  The migration will create:"
  echo "    • profiles table (with Row Level Security)"
  echo "    • user_preferences table (with Row Level Security)"
  echo "    • Auto-create profile trigger on signup"
  echo "    • Auto-update updated_at trigger"
  echo "    • Performance indexes"
  echo ""
  echo -e "${BOLD}============================================================${RESET}"
  echo ""
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  echo ""
  echo -e "${BOLD}Supabase Database Setup${RESET}"
  echo ""

  # Check if migration already applied
  if check_migration_via_rest; then
    echo ""
    success "Database is ready. No migration needed."
    echo ""
    exit 0
  fi

  # Get password
  PASSWORD=$(get_password "$@")

  if [ -z "$PASSWORD" ]; then
    print_instructions
    exit 1
  fi

  # Run migration
  echo ""
  run_migration "$PASSWORD"
}

main "$@"
