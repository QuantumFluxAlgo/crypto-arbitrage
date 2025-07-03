# Crypto Arbitrage

---

## Overview

Crypto Arbitrage is a multi-service platform designed to detect and execute cryptocurrency arbitrage opportunities.  
It consists of several autonomous agents that communicate through Redis and Postgres to execute trades, aggregate data, and provide a dashboard interface.

---

## Features

The platform is organized into distinct agents, each responsible for a specific set of tasks:

- **Executor Agent** – Java service for real-time detection and trade execution​:codex-file-citation[codex-file-citation]{line_range_start=7 line_range_end=13 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L7-L13"}​
- **API Gateway Agent** – Node.js REST API for settings, authentication, and metrics with routes such as `/opportunities`, `/settings`, and `/login`​:codex-file-citation[codex-file-citation]{line_range_start=17 line_range_end=25 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L17-L25"}​
- **Dashboard Agent** – React application offering a mobile-friendly interface with mode toggles, loss caps, and latency caps​:codex-file-citation[codex-file-citation]{line_range_start=29 line_range_end=33 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L29-L33"}​
- **Feed Aggregator Agent** – Gathers price feeds from multiple exchanges and pushes to Redis​:codex-file-citation[codex-file-citation]{line_range_start=37 line_range_end=41 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L37-L41"}​
- **Rebalancer Agent** – Rebalances hot wallets and sweeps profits based on NAV rules​:codex-file-citation[codex-file-citation]{line_range_start=45 line_range_end=50 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L45-L50"}​
- **Analytics Agent** – Python service with an LSTM model for spread prediction and Prometheus metrics exposure​:codex-file-citation[codex-file-citation]{line_range_start=54 line_range_end=58 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L54-L58"}​
- **Alert Agent** – Sends alerts for drawdowns, latency spikes, and mode changes​:codex-file-citation[codex-file-citation]{line_range_start=62 line_range_end=69 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L62-L69"}​
- **Circuit Breaker Agent** – Halts trading when risk thresholds are breached​:codex-file-citation[codex-file-citation]{line_range_start=73 line_range_end=79 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L73-L79"}​
- **Scheduler Agent** – Triggers periodic jobs such as rebalancing and backups​:codex-file-citation[codex-file-citation]{line_range_start=83 line_range_end=88 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L83-L88"}​
- **Secret Manager Agent** – Manages encrypted credentials via `kubeseal` and `sealed-secrets`​:codex-file-citation[codex-file-citation]{line_range_start=92 line_range_end=95 path=docs/agents.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/docs/agents.md#L92-L95"}​

---

## Requirements

The project is primarily tested on macOS with Xcode command line tools and any additional dependencies required by the services​:codex-file-citation[codex-file-citation]{line_range_start=19 line_range_end=24 path=README.md git_url="https://github.com/QuantumFluxAlgo/crypto-arbitrage/blob/develop/README.md#L19-L24"}​

---

## Dev Setup

The recommended local environment uses **Colima** with **Podman**.  
Start the virtual machine with Podman enabled:

```bash
colima start --runtime podman

---

## File Structure

root/
├── api/          # Node.js REST API
├── dashboard/    # React dashboard
├── executor/     # Java arbitrage engine
├── analytics/    # Python analytics service
├── docs/         # Agent descriptions and JSON definitions
└── scripts/      # Helper scripts (container builds, etc.)

Add a brief description of each directory as the project grows.

___

## Pre-push hook

To automatically run project tests before each push, copy the provided hook file and make it executable:

```bash
cp githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

The hook runs `npm test`, `pytest`, and `mvn test`. If any of these fail, the push will be blocked and you'll see an error message in the console.

---

### Instructions to update your repository

1. Open the repository in your editor.
2. Replace the contents of `README.md` with the file above.
3. Save the file and commit the change:  
   `git add README.md && git commit -m "Update README with platform details"`
4. Push the commit to your branch. The pre-push hook (if installed) will run the tests automatically.

This updated README provides an overview of all current components, setup instructions, and references the existing build and test scripts.

