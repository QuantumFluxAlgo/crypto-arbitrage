#!/bin/bash
# @dev-note: runs mocked tests only
set -euo pipefail
export TEST_ENV=local
npm --prefix dashboard test -- --runInBand
npm --prefix api test -- --runInBand
pytest -m env
executor/gradlew test -p executor -PtestEnv=local
