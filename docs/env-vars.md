# env-vars.md

## Common Variables

| Name | Description |
|------|-------------|
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Postgres connection settings |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection settings |
| `JWT_SECRET` | Token signing key for the API |
| `ADMIN_TOKEN` | Required for admin-only API endpoints |
| `SENTRY_DSN` | Error reporting endpoint |
| `PROM_URL` | Base URL for Prometheus |
| `SANDBOX_MODE` | Enable demo login without a database |

## Executor Variables

| Name | Purpose |
|------|---------|
| `STARTING_BALANCE` | Initial account balance for simulations |
| `COIN_CAP_PCT` | Max percentage of balance per coin |
| `MAX_BOOK_DEPTH_USD` | Order book depth to consider |
| `PREDICT_URL` | Analytics scoring endpoint |
| `CB_WIN_RATE_THRESHOLD` | Circuit breaker win-rate limit |
| `CB_MAX_DRAWDOWN_PCT` | Maximum drawdown before panic |
| `CANARY_MODE` / `GHOST_MODE` | Feature toggles |
| `USE_ENSEMBLE` | Enable ensemble model |
| `sweep_cadence` | Daily, Monthly, or None for automatic sweeps |
| `TEST_COLD_WALLET_ADDRESS` | Address used in sweep tests |
| `GHOST_FEED_CHANNEL` | Redis channel for ghost trades |
| `DB_RETRIES` / `DB_RETRY_DELAY_MS` | Database reconnection settings |

## Analytics Variables

| Name | Purpose |
|------|---------|
| `MODEL_PATH` | Location of the production model |
| `MODEL_SHADOW_PATH` | Path to the shadow model |
| `GPU_ENABLED` | Enable GPU acceleration |
