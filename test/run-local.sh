#!/bin/bash
# @dev-note: runs mocked tests only
set -euo pipefail
export TEST_ENV=local
npx jest --runInBand
pytest -m "env('local')"
./gradlew test -PtestEnv=local
