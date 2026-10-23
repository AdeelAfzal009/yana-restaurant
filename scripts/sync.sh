#!/usr/bin/env bash
# One menu for keeping this computer and the live site in step:
#
#   npm run sync                 shows the menu
#   npm run sync -- pull-content / push-content / pull-all / update
#
# It opens the private tunnel to the live database by itself (Railway CLI,
# already logged in and linked to the project), always shows a preview first,
# asks before changing anything, and closes the tunnel when done.
set -euo pipefail
cd "$(dirname "$0")/.."

# The keyboard is kept on fd 3 for this script's own questions; every other
# command gets no input, so docker, psql and the tunnel can't swallow answers.
exec 3<&0 </dev/null

TUNNEL_LOG="$(mktemp)"
TUNNEL_PID=""

cleanup() {
  # The Railway CLI runs ssh underneath; close both so no tunnel is left open.
  if [[ -n "$TUNNEL_PID" ]]; then
    pkill -P "$TUNNEL_PID" 2>/dev/null || true
    kill "$TUNNEL_PID" 2>/dev/null || true
  fi
  rm -f "$TUNNEL_LOG"
}
trap cleanup EXIT

# Steps that don't need the keyboard get, so they can't swallow
# the answers typed for the questions below.
say() { printf '\n\033[1m%s\033[0m\n' "$*"; }

confirm() {
  local answer
  read -r -p "$1 (y/N) " answer <&3
  [[ "$answer" =~ ^[Yy] ]]
}

start_local_db() {
  docker compose up -d db >/dev/null 2>&1
  for _ in $(seq 1 30); do
    docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1 && return 0
    sleep 2
  done
  echo "The local database didn't start. Is Docker Desktop running?"
  exit 1
}

# The local website keeps page content in memory for a minute; restarting it
# shows pulled changes straight away.
refresh_local_site() {
  if docker compose ps --status running --services 2>/dev/null | grep -qx web; then
    docker compose restart web >/dev/null 2>&1 && echo "Local website restarted: http://localhost:3100"
  fi
}

open_tunnel() {
  if ! railway whoami >/dev/null 2>&1; then
    echo "The Railway CLI isn't logged in. Run: railway login   (then npm run sync again)"
    exit 1
  fi
  say "Connecting to the live database …"
  # No fixed port: Railway picks a free one and prints it in the address.
  railway connect Postgres --tunnel-only >"$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!
  disown "$TUNNEL_PID" 2>/dev/null || true
  for _ in $(seq 1 40); do
    LIVE_DATABASE_URL="$(grep -oE 'postgresql://[^ ]+' "$TUNNEL_LOG" | head -1 || true)"
    local port="${LIVE_DATABASE_URL##*:}"
    port="${port%%/*}"
    if [[ -n "$LIVE_DATABASE_URL" ]] && nc -z 127.0.0.1 "$port" 2>/dev/null; then
      export LIVE_DATABASE_URL
      echo "Connected."
      return 0
    fi
    if ! kill -0 "$TUNNEL_PID" 2>/dev/null; then break; fi
    sleep 1
  done
  echo "Could not open the tunnel. Railway said:"
  sed 's/^/  /' "$TUNNEL_LOG"
  echo "If it mentions the project or service, run: railway link   (pick prolific-patience → production)"
  exit 1
}

pull_content() {
  say "Website content: live → this computer"
  npm run --silent db:pull-content
  if confirm "Copy these sections down to this computer?"; then
    npm run --silent db:pull-content -- --apply
    refresh_local_site
  else
    echo "Nothing was changed."
  fi
}

push_content() {
  say "Website content: this computer → LIVE website"
  TARGET_DATABASE_URL="$LIVE_DATABASE_URL" npm run --silent db:push-content
  if confirm "Send these sections to the LIVE website?"; then
    TARGET_DATABASE_URL="$LIVE_DATABASE_URL" npm run --silent db:push-content -- --apply
  else
    echo "Nothing was changed."
  fi
}

pull_all() {
  say "Everything (bookings, guests, tables, content, files, staff): live → this computer"
  bash scripts/pull-database.sh
  echo
  echo "This REPLACES everything on this computer with the live copy (yours is backed up first)."
  if confirm "Replace this computer's data with live?"; then
    bash scripts/pull-database.sh --apply
    refresh_local_site
  else
    echo "Nothing was changed."
  fi
}

update_site() {
  say "Updating the local website to the latest code"
  git pull --ff-only origin main
  docker compose up -d --build
  echo "Local website: http://localhost:3100"
}

run() {
  case "$1" in
    pull-content) start_local_db; open_tunnel; pull_content ;;
    push-content) start_local_db; open_tunnel; push_content ;;
    pull-all)     start_local_db; open_tunnel; pull_all ;;
    update)       update_site ;;
    *) echo "Unknown choice: $1"; exit 1 ;;
  esac
}

if [[ $# -gt 0 ]]; then
  run "$1"
  exit 0
fi

cat <<'MENU'

  YANA — sync this computer with the live site

  1) Pull website content     live → here   (dashboard text, photos, menus)
  2) Push website content     here → LIVE   (publish your local dashboard edits)
  3) Pull everything          live → here   (+ bookings, guests, tables, staff; replaces local)
  4) Update local website     latest code from GitHub, rebuilt in Docker
  5) Quit

MENU
read -r -p "Choose 1-5: " choice <&3
case "$choice" in
  1) run pull-content ;;
  2) run push-content ;;
  3) run pull-all ;;
  4) run update ;;
  *) echo "Bye." ;;
esac
