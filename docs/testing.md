# Test Environment Tags

This project separates tests into **local** and **live** environments. Use the environment variable or build property to run the desired set:

- **Python**: each test file defines `pytestmark = pytest.mark.env("local"|"live")`. Pytest is configured via `pytest.ini` to recognize the `env` marker. Run with `pytest -m env("local")` or `env("live")`.
- **Node.js / React**: test suites call `describeLocal` or `describe('LIVE: ...')`. Tests wrapped with `describeLocal` run only when `process.env.TEST_ENV` is `local`. Live blocks are skipped unless `TEST_ENV` is `live`.
- **Java**: JUnit tests use `@Tag("local")` or `@Tag("live")`. Gradle's `testEnv` property controls which tagged tests execute: `./gradlew test -PtestEnv=local` or `-PtestEnv=live`.

Use these tags to avoid hitting external services when running the default local test suite.
