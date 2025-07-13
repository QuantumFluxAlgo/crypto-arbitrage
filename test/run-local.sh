#!/bin/bash
# @dev-note: runs mocked tests only
set -euo pipefail
export TEST_ENV=local
npx jest --runInBand --config dashboard/jest.config.js
npx jest --runInBand --config api/jest.config.js
pytest -m "env('local')"
./gradlew test -PtestEnv=local
