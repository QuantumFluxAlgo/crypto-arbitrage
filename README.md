# 🪙 Prism Arbitrage Platform

![CI](https://github.com/QuantumFluxAlgo/crypto-arbitrage/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/QuantumFluxAlgo/crypto-arbitrage/actions/workflows/release.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Sentry](https://img.shields.io/badge/sentry-monitoring-orange)

---

## Overview

**Prism** is a Kubernetes based multi-agent platform for high frequency crypto arbitrage. A Node.js API and React dashboard drive operation while a Java executor performs trades and Python analytics expose performance metrics. Ten plus CEXs and four DEXs are supported via a Redis feed aggregator.

---

## Quick Setup

1. Clone the repository and install all tools:
   ```bash
   git clone https://github.com/prism-arbitrage/crypto-arbitrage.git
   cd crypto-arbitrage
   ./scripts/setup_env.sh
   ```
2. Run the full test suite:
   ```bash
   ./test/run-local.sh
   ```
3. Launch the local sandbox:
   ```bash
   ./scripts/start-sandbox.sh
   ```
  Open <http://localhost:5173> for the dashboard.

---

## Local Sandbox Deployment

For a full local cluster using Kind in Multipass, follow the guide in
[docs/local-deployment.md](docs/local-deployment.md). It covers building the
Docker images, loading them into your Kind node, and installing the Helm chart
in dry-run mode.

---

## Execution Modes

- **DRY_RUN** – Local mock mode using ghost trades and fake wallets.
- **SANDBOX** – Kubernetes deploy with sealed secrets but no live orders.
- **LIVE** – Real trades; startup aborts if any required secrets are missing.

### Test Login (Dry Run & Sandbox)

When `DRY_RUN=true` or running the sandbox, the API exposes a fake login for testing.

```text
POST /api/login
{ "email": "admin@prism.one", "password": "test123" }
```

Use the returned JWT token for authenticated endpoints when testing locally or in the sandbox.

`EXECUTION_MODE` controls the mode for every service.

---

## Feature Summary

- Real time spread detection across 10+ CEXs and 4 DEXs
- React SPA dashboard with mobile layout
- Python analytics service with optional GPU acceleration
- Secrets stored via SealedSecrets
- Optional Prometheus and Grafana monitoring
- Automatic cold wallet sweeps

---

## API Overview

| Method | Path | Notes |
|-------|------|------|
| `GET` | `/opportunities` | Returns `{ opportunities: [...], executionMode: 'live', lastUpdated: 'ISO' }` |
| `POST`/`PATCH` | `/settings` | Validated inputs update runtime config |
| `POST` | `/panic` | Triggers a panic brake when allowed |
| `POST` | `/resume` | Clears panic state. Live mode requires `confirm=true` |
| `GET` | `/metrics` | Prometheus metrics including `pnl_total`, `sharpe_ratio` |

The API denies unauthenticated writes except when sandbox mode explicitly exposes them. `/resume` and `/panic` are guarded by the current execution mode.

---

## Panic and Resume

- Panic can be issued from the dashboard or `/panic` endpoint.
- The executor listens on a Redis pub/sub channel and halts when `halt` is published.
- Resuming trading shows a confirmation modal in the dashboard. The UI polls until the backend replies with `{ status: 'resumed', confirmed: true, mode: 'live' }`.
- In live mode, missing `confirm=true` results in `{ error: 'confirmation_required' }`.

---

## Cold Wallet Sweeps

Profit is swept to a cold wallet when either of the following is met:

- Profit ≥ £5,000
- Profit ≥ 30% of total capital

In DRY_RUN or SANDBOX mode the sweeper logs the action without moving funds:
`{"event":"cold_wallet_sweep","mode":"DRY_RUN",...}`.

---

## Metrics

The analytics service exposes fresh Prometheus metrics at `/metrics`. Key series include:

- `pnl_total` – cumulative realised PnL
- `sharpe_ratio` – strategy sharpe ratio
- `panic_triggered_total` – count of panic events

Metrics are labelled by execution mode and scraped by Prometheus.

---

## Contribution Flow

1. Create branches as `fix/pr-##-<area>` (replace `##` with the issue number).
2. Commit messages follow the style `fix(api): panic route guards updated`.
3. Run `./test/run-local.sh` before pushing and open a PR against `develop`.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full guidelines.

---

Released under the [MIT](LICENSE) license.
