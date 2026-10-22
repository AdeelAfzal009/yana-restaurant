#!/usr/bin/env bash
# Makes the LOCAL database an exact copy of the live one: bookings, guests,
# tables, website content and uploads, email history, logs and staff accounts.
#
#   LIVE_DATABASE_URL="postgresql://…" npm run db:pull-all              preview only
#   LIVE_DATABASE_URL="postgresql://…" npm run db:pull-all -- --apply   replace local with live
#
# LIVE_DATABASE_URL is the address `railway connect Postgres --tunnel-only` prints.
# Live is only ever read. Local is saved to backups/ before it's replaced, and
# can be put back with:
#   docker compose exec -T db pg_restore -U postgres -d yana --clean --if-exists --no-owner < backups/<file>.dump
#
# Uses the tools inside the local Postgres container (docker compose service "db").
set -euo pipefail

LOCAL_DB="${LOCAL_DB_NAME:-yana}"
APPLY=false
[[ "${1:-}" == "--apply" ]] && APPLY=true

if [[ -z "${LIVE_DATABASE_URL:-}" ]]; then
  echo "Set LIVE_DATABASE_URL to the live database (the address \`railway connect Postgres --tunnel-only\` prints)."
  exit 1
fi

if ! docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
  echo "The local database isn't running. Start it with: docker compose up -d db"
  exit 1
fi

# The tunnel listens on this computer; from inside the container that's
# host.docker.internal, not localhost.
LIVE_URL="$(sed -E 's#@(localhost|127\.0\.0\.1)([:/])#@host.docker.internal\2#' <<<"$LIVE_DATABASE_URL")"

in_db() { docker compose exec -T db "$@"; }

COUNTS="select 'bookings', count(*) from reservations union all
        select 'guests', count(*) from guests union all
        select 'tables', count(*) from restaurant_tables union all
        select 'website content sections', count(*) from site_content union all
        select 'uploaded files', count(*) from media union all
        select 'staff accounts', count(*) from staff"

echo "Live:"
if ! LIVE_COUNTS="$(in_db psql "$LIVE_URL" -At -F ': ' -c "$COUNTS" 2>&1)"; then
  echo "  Could not reach the live database. Is the tunnel running, and is the address right?"
  echo "  $LIVE_COUNTS"
  exit 1
fi
sed 's/^/  /' <<<"$LIVE_COUNTS"

# pg_dump can only copy a database of the same or an older Postgres version.
LIVE_MAJOR="$(in_db psql "$LIVE_URL" -At -c 'show server_version_num' | tr -d '\r' | cut -c1-2)"
LOCAL_MAJOR="$(in_db pg_dump --version | grep -oE '[0-9]+' | head -1)"
if (( LIVE_MAJOR > LOCAL_MAJOR )); then
  echo
  echo "Live runs Postgres $LIVE_MAJOR but the local database is Postgres $LOCAL_MAJOR, which can't copy it."
  echo "Set the db image in docker-compose.yml to postgres:$LIVE_MAJOR-alpine and ask for help moving the local data across."
  exit 1
fi
echo "Local now:"
in_db psql -U postgres -d "$LOCAL_DB" -At -F ': ' -c "$COUNTS" 2>/dev/null | sed 's/^/  /' || echo "  (empty)"

if ! $APPLY; then
  echo
  echo "Preview only: nothing was changed. Add -- --apply to replace local with live."
  exit 0
fi

mkdir -p backups
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
LOCAL_BACKUP="backups/local-db-$STAMP.dump"
LIVE_DUMP="backups/live-db-$STAMP.dump"

echo
echo "Saving local to $LOCAL_BACKUP …"
in_db pg_dump -U postgres -d "$LOCAL_DB" -Fc --no-owner --no-acl > "$LOCAL_BACKUP"

echo "Copying live to $LIVE_DUMP …"
if ! in_db pg_dump "$LIVE_URL" -Fc --no-owner --no-acl > "$LIVE_DUMP" || [[ ! -s "$LIVE_DUMP" ]]; then
  rm -f "$LIVE_DUMP"
  echo "Copying from live failed (see the message above). Nothing local was changed."
  exit 1
fi

echo "Replacing local with live …"
in_db psql -U postgres -d "$LOCAL_DB" -q -v ON_ERROR_STOP=1 -c \
  "drop schema if exists drizzle cascade; drop schema public cascade; create schema public;"
in_db pg_restore -U postgres -d "$LOCAL_DB" --no-owner --no-acl < "$LIVE_DUMP"

echo
echo "Done. Local is now a copy of live:"
in_db psql -U postgres -d "$LOCAL_DB" -At -F ': ' -c "$COUNTS" | sed 's/^/  /'
echo
echo "Sign in to the local dashboard with your LIVE email and password."
echo "Restart npm run dev so it doesn't hold on to old content from memory."
