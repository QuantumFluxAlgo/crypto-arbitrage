# Feed Aggregator Service

This service collects live order book data from supported exchanges and forwards
normalized snapshots to Redis. It is always enabled in the default Docker image
and runs continuously.

## Usage

Install dependencies and start the service:

```bash
npm install
node index.js
```

The service publishes books to the Redis channel specified by `ORDERBOOK_CHANNEL` (default `orderbook`)
and sends alerts to `ALERT_CHANNEL` (default `alerts`). A health check is available at
`http://localhost:8090/health`.

Alerts are throttled so repeated errors with the same message within 60 seconds
are suppressed. If Redis is unavailable, alert payloads are written to
`alerts-fallback.log`.

## Configuration

Create an `.env` file or export the following variables before starting the
service:

| Name | Description |
|------|-------------|
| `FEED_URL` | WebSocket endpoint for order book data |
| `ORDERBOOK_CHANNEL` | Redis channel for normalized books |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection info |
| `HEALTH_PORT` | Port for the `/health` check |
| `MAX_RECONNECT_ATTEMPTS` | Number of reconnect tries before exit |
| `ALERT_CHANNEL` | Redis channel for alert payloads |
| `THROTTLE_MS` | Minimum time between duplicate alerts |
| `LOG_LEVEL` | Logging level (`info`, `debug`, etc.) |
| `MOCK_REDIS` | Skip Redis publishing when set |

## Tests

Run the Python-based test suite after installing dependencies:

```bash
npm install
npm test
```

Tests verify the JSON agent manifest, the `/health` endpoint and the `normalize`
function.
