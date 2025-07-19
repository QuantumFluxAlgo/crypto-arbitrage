#!/bin/bash
# verify-env.sh - Ensure local test tools (Jest, PyTest, Gradle) are installed
# @dev-note: prepares the environment for run-local.sh

set -euo pipefail

install_node_deps() {
  npm install
  npm install --prefix api
  npm install --prefix dashboard
}

# check for local jest binary
if [ ! -x "dashboard/node_modules/.bin/jest" ] || [ ! -x "api/node_modules/.bin/jest" ]; then
  echo "Jest not found; installing Node.js dependencies..." >&2
  install_node_deps
fi

ensure_python_deps() {
  if [ ! -d .venv ]; then
    python3 -m venv .venv
  fi
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
}

if ! python - <<'EOF' >/dev/null 2>&1
import numpy
import flask
EOF
then
  echo "Python dependencies missing; installing..." >&2
  ensure_python_deps
else
  if [ -f .venv/bin/activate ] && [ -z "${VIRTUAL_ENV:-}" ]; then
    source .venv/bin/activate
  fi
fi

echo "Environment verified"
