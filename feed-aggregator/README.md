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

## Tests

Run the Python-based test suite after installing dependencies:

```bash
npm install
npm test
```

Tests verify the JSON agent manifest, the `/health` endpoint and the `normalize`
function.
