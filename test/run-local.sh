#!/bin/bash
# @dev-note: runs mocked tests only
set -euo pipefail

# ensure test dependencies are available
source "$(dirname "$0")/verify-env.sh"

export TEST_ENV=local
npm --prefix dashboard test -- --runInBand
npm --prefix api test -- --runInBand
pytest -m "env('local')"
executor/gradlew test -p executor -PtestEnv=local
