#!/bin/bash
# verify-env.sh - Ensure Jest, PyTest and Maven are available

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

# Check Maven if project uses pom.xml
if find "$(dirname "$0")/.." -name pom.xml | grep -q pom.xml; then
  if ! mvn -v >/dev/null 2>&1; then
    echo "Error: Maven not installed" >&2
    exit 1
  fi
fi

echo "Environment verified"
