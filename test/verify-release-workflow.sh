#!/bin/bash
# verify-release-workflow.sh - Validate release.yml workflow steps
set -e
workflow=".github/workflows/release.yml"

declare -a steps=(
  "Checkout repository"
  "Setup Node.js"
  "Setup Python"
  "Setup Java"
  "Install Podman"
  "Build service images"
  "Install Syft"
  "Generate SBOMs"
  "Upload release assets"
)

for step in "${steps[@]}"; do
  if ! grep -q "$step" "$workflow"; then
    echo "Missing step: $step" >&2
    exit 1
  fi
done

echo "release.yml workflow steps verified"

