#!/bin/bash
# verify-env.sh - Ensure Jest and PyTest are available

set -euo pipefail

# Check Jest
if ! npx -y jest --version >/dev/null 2>&1; then
  echo "Error: Jest not found" >&2
  exit 1
fi

# Check PyTest
if ! pytest --version >/dev/null 2>&1; then
  echo "Error: PyTest not found" >&2
  exit 1
fi


echo "Environment verified"
