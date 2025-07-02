#!/bin/bash
# verify-env.sh - Check if key toolchains are installed
#
# Usage: bash test/verify-env.sh
#
# This script checks versions of Jest, PyTest, and Maven. If any check
# fails, the script exits with a non-zero status.

set -e

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

# Check Maven
mvn -v >/dev/null 2>&1 || {
  echo "Error: Maven is not installed" >&2
  exit 1
}

echo "Environment verified"
