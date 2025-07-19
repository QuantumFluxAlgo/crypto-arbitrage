# risk-controls.md

## Overview

Multiple layers of safety protect capital during trading.

### Circuit Breaker

- Monitors daily loss percentage and execution latency.
- If losses exceed `CB_MAX_DRAWDOWN_PCT` or win rate falls below `CB_WIN_RATE_THRESHOLD`, trading halts automatically.
- The dashboard provides a **Resume Trading** button once conditions normalize.

### Panic Mode

Operators can trigger Panic mode manually from the dashboard or via the API. This immediately cancels open orders and stops new trades until resumed.

### Exposure Caps

`COIN_CAP_PCT` limits the maximum allocation per asset, while `STARTING_BALANCE` defines total capital at risk. Adjust these settings in the executor `.env` file.

All risk events are logged to Postgres and surfaced through Prometheus metrics for alerting.
