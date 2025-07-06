#!/bin/bash
# start-sandbox.sh - Launch local sandbox server with fake UI and API
#
# Loads .env.sandbox and runs API, dashboard, and executor with ghost trading
# enabled. Also spawns the mock trade publisher so the UI can display example
# data. Used by founders, demo operators, or testers.
#
# Usage: ./scripts/start-sandbox.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.sandbox"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$ENV_FILE"

# Start API service
(
  cd "$ROOT_DIR/api"
  NODE_ENV=sandbox node index.js &
  echo $! > "$ROOT_DIR/.api.pid"
)
API_PID=$(cat "$ROOT_DIR/.api.pid")

# Start dashboard UI
(
  cd "$ROOT_DIR/dashboard"
  npm run dev &
  echo $! > "$ROOT_DIR/.ui.pid"
)
UI_PID=$(cat "$ROOT_DIR/.ui.pid")

# Start Java executor in ghost mode
(
  cd "$ROOT_DIR/executor"
  GHOST_MODE=true ./gradlew run &
  echo $! > "$ROOT_DIR/.exec.pid"
)
EXEC_PID=$(cat "$ROOT_DIR/.exec.pid")

# Publish fake trades
node "$ROOT_DIR/scripts/mock-ghost-feed.js" &
MOCK_PID=$!

trap 'kill $API_PID $UI_PID $EXEC_PID $MOCK_PID' EXIT
sleep 2

echo "Sandbox running. Open http://localhost:5173 to view the dashboard."

wait
