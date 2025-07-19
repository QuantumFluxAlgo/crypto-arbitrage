# env-vars.md

## What It Does
Lists environment variables used across services.

## Common Variables

| Name | Description |
|------|-------------|
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Postgres connection settings |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_CHANNEL` | Redis host, port and pub/sub channel |
| `JWT_SECRET` | Token signing key for the API |
| `ADMIN_TOKEN` | Required for admin-only API endpoints |
| `SENTRY_DSN` | Error reporting endpoint |
| `PROM_URL` | Base URL for Prometheus |
| `SANDBOX_MODE` | Enable demo login without a database |

## Executor Variables

| Name | Purpose |
|------|---------|
| `PERSONALITY_MODE` | Trading mode: `AUTO`, `REALISTIC`, or `AGGRESSIVE` |
| `STARTING_BALANCE` | Initial account balance for simulations |
| `COIN_CAP_PCT` | Max percentage of balance per coin |
| `MAX_BOOK_DEPTH_USD` | Order book depth to consider |
| `LOSS_CAP_PCT` | Daily loss cutoff percentage |
| `LATENCY_MAX_MS` | Max allowed execution latency |
| `WIN_RATE_THRESHOLD` | Minimum win rate before halt |
| `PREDICT_URL` | Analytics scoring endpoint |
| `ANALYTICS_URL` | Trade logging service endpoint |
| `CB_WIN_RATE_THRESHOLD` | Circuit breaker win-rate limit |
| `CB_MAX_DRAWDOWN_PCT` | Maximum drawdown before panic |
| `CANARY_MODE` / `GHOST_MODE` | Feature toggles |
| `USE_ENSEMBLE` | Enable ensemble model |
| `sweep_cadence` | Daily, Monthly, or None for automatic sweeps |
| `TEST_COLD_WALLET_ADDRESS` | Address used in sweep tests |
| `GHOST_FEED_CHANNEL` | Redis channel for ghost trades |
| `SANDBOX_SLIPPAGE` / `SANDBOX_FEE` / `SANDBOX_LATENCY_MS` | Sandbox exchange settings |
| `DB_RETRIES` / `DB_RETRY_DELAY_MS` | Database reconnection settings |

## API Variables

| Name | Purpose |
|------|---------|
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Outgoing mail server |
| `ALERT_RECIPIENT` | Email address for alerts |
| `TELEGRAM_TOKEN` / `TELEGRAM_CHAT_ID` | Telegram alert settings |
| `WEBHOOK_URL` | Generic alert webhook |
| `WS_PORT` | WebSocket server port |
| `LOG_LEVEL` | Log level for API service |
| `NODE_ENV` | Node runtime mode |
| `TEST_ENV` | Local vs live test selection |

## Analytics Variables

| Name | Purpose |
|------|---------|
| `FLASK_ENV` | Flask environment mode |
| `MODEL_PATH` | Location of the production model |
| `MODEL_SHADOW_PATH` | Path to the shadow model |
| `GPU_ENABLED` | Enable GPU acceleration |
| `LOG_LEVEL` | Logging level for analytics service |
