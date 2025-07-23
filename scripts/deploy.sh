#!/bin/bash
# deploy.sh - Deploy Helm release with snapshotting

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHART_DIR="$ROOT_DIR/infra/helm"

# Extract version from Chart.yaml
VERSION=$(grep '^version:' "$CHART_DIR/Chart.yaml" | awk '{print $2}')
SNAPSHOT_DIR="/ops/snapshots/prism-prod-$VERSION"

mkdir -p "$SNAPSHOT_DIR"

# Capture current commit from main branch
git -C "$ROOT_DIR" rev-parse HEAD > "$SNAPSHOT_DIR/commit.txt"

# Copy active values.yaml
cp "$CHART_DIR/values.yaml" "$SNAPSHOT_DIR/values.yaml"

# Record release notes
if [ -n "${RELEASE_NOTES:-}" ]; then
  echo "$RELEASE_NOTES" > "$SNAPSHOT_DIR/notes.md"
else
  read -rp "Enter release notes: " NOTES
  echo "$NOTES" > "$SNAPSHOT_DIR/notes.md"
fi

cd "$CHART_DIR"
helm upgrade --install prism-prod . --namespace default

helm history prism-prod

echo "To rollback: helm rollback prism-prod <REVISION>"
