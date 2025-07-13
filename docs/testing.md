# Test Environment Tags

This project separates tests into **local** and **live** environments. Use the environment variable or build property to run the desired set:

- **Python**: each test file defines `pytestmark = pytest.mark.env("local"|"live")`. Pytest is configured via `pytest.ini` to recognize the `env` marker. Run with `pytest -m env("local")` or `env("live")`.
- **Node.js / React**: test suites call `describeLocal` or `describe('LIVE: ...')`. Tests wrapped with `describeLocal` run only when `process.env.TEST_ENV` is `local`. Live blocks are skipped unless `TEST_ENV` is `live`.
- **Java**: JUnit tests use `@Tag("local")` or `@Tag("live")`. Gradle's `testEnv` property controls which tagged tests execute: `./gradlew test -PtestEnv=local` or `-PtestEnv=live`.

Use these tags to avoid hitting external services when running the default local test suite.

## `test:local` vs `test:live`

`test:local` runs with mocked Redis and Postgres containers and is triggered on every pull request as well as by the `githooks/pre-push` script. `test:live` points the same suites at the staging cluster and runs after a build succeeds. CI prefixes each line with the job name so it is clear which environment produced the output.

### Tag mapping by service

- **analytics** (`pytest`) – `pytestmark = pytest.mark.env("local")` or `pytest.mark.env("live")`
- **api** / **dashboard** (`jest`) – `describeLocal(...)` or `describe('LIVE: ...')`
- **executor** (`JUnit`) – `@Tag("local")` or `@Tag("live")`

### Examples

```python
# analytics/test_stats.py
pytestmark = pytest.mark.env("local")

def test_win_ratio():
    pass
```

```javascript
// api/__tests__/panicResume.test.js
describe('LIVE: redis pubsub', () => {
  test('resumes system', async () => {
    /* ... */
  });
});
```

```java
// executor/src/test/java/RebalancerLiveTest.java
@Tag("live")
class RebalancerLiveTest {
    // ...
}
```

During a GitHub Actions run you should see lines such as:

```
✅ [test:local] api login returns cookie
✅ [test:live] redis pubsub resumes system
```
