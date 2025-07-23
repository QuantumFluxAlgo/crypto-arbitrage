#!/bin/bash
# verify-env.sh - Ensure local test tools (Jest, PyTest, Gradle) are installed
# @dev-note: prepares the environment for run-local.sh

set -euo pipefail

# fail fast if any development secrets are committed
for dir in api executor dashboard; do
  if [ -f "$dir/.env" ]; then
    echo "Error: unsealed secret file $dir/.env detected" >&2
    exit 1
  elif [ -f "$dir/.env.example" ]; then
    echo "Found $dir/.env.example (ok)"
  fi
done

# sandbox environment file should never be committed
if [ -f ".env.sandbox" ]; then
  echo "Error: plaintext .env.sandbox file detected" >&2
  exit 1
fi

# ensure no plain Kubernetes Secret manifests exist in Helm templates
if grep -q "kind: Secret" infra/helm/templates/*.yaml 2>/dev/null; then
  echo "Error: unsealed Kubernetes Secret found in Helm templates" >&2
  exit 1
fi

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

echo "Helm release history:"
helm history prism-prod || echo "No release history found."

curl -sf http://localhost:8080/api/metrics/live >/dev/null
curl -sf http://localhost:8080/api/metrics/sandbox >/dev/null
if [ "${PANIC:-}" = "true" ] && [ "${HEARTBEAT:-}" = "dead" ]; then
  code=$(curl -o /dev/null -w '%{http_code}' -s http://localhost:8080/api/resume)
  if [ "$code" -ne 503 ]; then
    echo "Error: resume endpoint should return 503 when system unsafe" >&2
    exit 1
  fi
fi
