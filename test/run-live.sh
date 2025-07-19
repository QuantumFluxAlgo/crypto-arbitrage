#!/bin/bash
# @dev-note: runs integration tests against live services
export TEST_ENV=live
npx jest --runInBand
pytest -m "env('live')"
executor/gradlew test -PtestEnv=live
