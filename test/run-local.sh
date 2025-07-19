#!/bin/bash
# @dev-note: runs mocked tests only
set -euo pipefail
export TEST_ENV=local
npx --yes jest --runInBand --config dashboard/jest.config.js
npx --yes jest --runInBand --config api/jest.config.js
pytest -m env
executor/gradlew test -p executor -PtestEnv=local
