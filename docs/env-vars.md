# env-vars.md

## What It Does
Lists environment variables used across services.

## Common Variables

| Name | Description |
|------|-------------|
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Postgres connection settings |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_CHANNEL` | Redis host, port and pub/sub channel |
| `ORDERBOOK_CHANNEL` / `ALERT_CHANNEL` | Feed and alert Redis channels |
| `JWT_SECRET` | Token signing key for the API (required in production) |
| `ADMIN_TOKEN` | Required for admin-only API endpoints (set a strong value for production) |
| `SENTRY_DSN` | Error reporting endpoint |
| `PROM_URL` | Base URL for Prometheus |
| `SANDBOX_MODE` | Enable demo login without a database (must be `false` in production) |

## Executor Variables

| Name | Purpose |
|------|---------|
| `PERSONALITY_MODE` | Trading mode: `AUTO`, `REALISTIC`, or `AGGRESSIVE` |
| `STARTING_BALANCE` | Initial account balance for simulations |
| `COIN_CAP_PCT` | Max percentage of balance per coin |
| `MAX_BOOK_DEPTH_USD` | Order book depth to consider |
| `LOSS_CAP_PCT` | Daily loss cutoff percentage |
| `PROFIT_TARGET_USD` | Daily profit target before pause |
| `MAX_SLIPPAGE_PCT` | Maximum allowed slippage percentage |
| `LATENCY_MAX_MS` | Max allowed execution latency |
| `WIN_RATE_THRESHOLD` | Minimum win rate before halt |
| `PREDICT_URL` | Analytics scoring endpoint |
| `ANALYTICS_URL` | Trade logging service endpoint |
| `CB_WIN_RATE_THRESHOLD` | Circuit breaker win-rate limit |
| `CB_MAX_DRAWDOWN_PCT` | Maximum drawdown before panic |
| `MAX_OPEN_TRADES` | Maximum number of simultaneous trades |
| `CANARY_MODE` / `GHOST_MODE` | Feature toggles |
| `USE_ENSEMBLE` | Enable ensemble model |
| `sweep_cadence` | Daily, Monthly, or None for automatic sweeps |
| `REBALANCE_INTERVAL_MINUTES` | Minutes between balance scans |
| `SWEEP_INTERVAL_DAYS` | Days between cold sweep evaluations |
| `ARB_SCAN_MS` | Minimum milliseconds between triangular scans |
| `REDIS_BASE_DELAY_MS` / `REDIS_MAX_DELAY_MS` | Redis reconnect backoff settings |
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
| `API_KEY` | Required for API access (e.g., `dummy123`) |
| `BINANCE_KEY` / `BINANCE_SECRET` | Exchange credentials (defaults `dummy123`) |
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
| `LOG_LEVEL` | Logging level for analytics service |

## Feed Aggregator Variables

| Name | Purpose |
|------|---------|
| `FEED_URL` | WebSocket endpoint for exchange data |
| `ORDERBOOK_CHANNEL` | Redis channel for normalized books |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection details |
| `HEALTH_PORT` | Port for the `/health` endpoint |
| `MAX_RECONNECT_ATTEMPTS` | Reconnect attempts before exit |
| `ALERT_CHANNEL` | Redis channel for alerts |
| `THROTTLE_MS` | Minimum milliseconds between alerts |
| `LOG_LEVEL` | Logging level for the service |
| `MOCK_REDIS` | Disable Redis writes during tests |

## Dashboard Variables

| Name | Purpose |
|------|---------|
| `VITE_ENABLE_SENTRY` | Enable Sentry monitoring when `true` |
| `VITE_SENTRY_DSN` | Sentry DSN for React error reports |
