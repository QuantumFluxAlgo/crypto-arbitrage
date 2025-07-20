# ui-guide.md

## Screens

- **Dashboard** – real‑time system status and recent trades.
- **Risk Panel** – adjust exposure caps and trigger Panic mode.
- **Settings** – update personality mode, API tokens, and sweep cadence.
- **Logs** – view recent alerts and execution metrics.

## Navigation

The dashboard is a React SPA served from the API gateway. Authentication uses JWT cookies. Use the left navigation bar to switch panels. On mobile devices the menu collapses into a hamburger icon.

## Resume Trading

When the system enters Panic mode, a red banner appears at the top of the dashboard. After resolving the issue, click **Resume Trading** to clear the panic state across all services.

## Latency Metrics

The top-right status area displays the latest API latency and trade execution delay.
Use these metrics to monitor system health:

1. Open **Logs** and switch to the *Metrics* tab.
2. Check `api_latency_ms` and `trade_latency_ms` graphs.
3. Set alert thresholds in Grafana to notify when latency exceeds 250ms.
