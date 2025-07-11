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

The service publishes books to the `orderbook` Redis channel and exposes a
health check on `http://localhost:8090/health`.

## Tests

Run the Python-based test suite after installing dependencies:

```bash
npm install
npm test
```

Tests verify the JSON agent manifest, the `/health` endpoint and the `normalize`
function.
