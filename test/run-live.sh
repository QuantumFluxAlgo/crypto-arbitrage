#!/bin/bash
# @dev-note: runs integration tests against live services
export TEST_ENV=live
npx jest --runInBand
pytest -m "env('live')"
./gradlew test -PtestEnv=live
