#!/bin/bash
# @dev-note: runs integration tests against live services
export TEST_ENV=live
npm --prefix dashboard test -- --runInBand
npm --prefix api test -- --runInBand
pytest -m "env('live')"
executor/gradlew test -PtestEnv=live
