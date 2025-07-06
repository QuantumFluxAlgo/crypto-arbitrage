#!/bin/bash
# verify-env.sh - Check if key toolchains are installed
#
# Usage: bash test/verify-env.sh
#
# This script checks versions of Jest, PyTest, and Maven. If any check
# fails, the script exits with a non-zero status. Maven is required only
# if a `pom.xml` file exists in the project.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check Jest via npx
npx -y jest --version >/dev/null 2>&1 || {
  echo "Error: Jest is not installed or not accessible via npx" >&2
  exit 1
}

# Check PyTest
pytest --version >/dev/null 2>&1 || {
  echo "Error: PyTest is not installed" >&2
  exit 1
}

# Check Maven only if the project uses it (presence of pom.xml)
if find "$REPO_ROOT" -name pom.xml | grep -q pom.xml; then
  if mvn -v >/dev/null 2>&1; then
    echo "Maven found"
  else
    echo "Error: Maven is required but not installed" >&2
    exit 1
  fi
else
  echo "Maven not required"
fi

echo "Environment verified"

