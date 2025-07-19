# Agents Overview – Crypto Arbitrage Platform

This document defines all autonomous agents, modules, and services operating across the Crypto Arbitrage Platform. Each is responsible for a specific capability and operates either continuously or via scheduled intervals. All agents are containerized, CI-tested, and deployed to a single-node Kubernetes cluster.

---

## 🧠 Strategy Engine Agent (`executor`)

- **Language**: Java 17 (OpenJDK)
- **Role**: Detects arbitrage opportunities across 10 CEXs and 4 DEXs.
- **Functions**:
  - Cross-exchange and intra-exchange (triangular) spread detection.
  - Slippage-aware position sizing.
  - IOC and tight-limit execution with latency <60μs.
  - Logs trades, P&L, slippage to Postgres.
- **Personality Modes**: Realistic, Aggressive, Auto-switch (volatility-aware).
- **Fail-safes**: Cancels partial fills, handles reconnections.
- **Data Inputs**: Redis pub/sub (normalized order books).
- **Schedule**: Continuous.

---

## ⚡ Exchange Feed Agent (`feed-aggregator`)

- **Language**: Node.js
- **Role**: Aggregates live order book data from exchanges.
- **Functions**:
  - WebSocket ingestion from 10 CEXs & 4 DEXs.
  - Rate-limit aware.
  - Normalizes feeds & publishes to Redis.
- **Recovery**: Auto-reconnect + REST fallback.
- **Schedule**: Continuous.

---

## 🧮 Analytics Agent (`analytics`)

- **Language**: Python 3.10
- **Role**: Predictive modeling, live stats, GPU-enhanced analysis.
- **Functions**:
  - Rolling P&L, Sharpe, hit-ratio.
  - Optional: LSTM spread probability model (Tesla P4).
  - Prometheus metrics exposed for Grafana.
- **Schedule**: Rolling + on-demand inference.

---

## ♻️ Rebalancer + Sweep Agent (`rebalancer`)

- **Language**: Python or Node.js (modular)
- **Role**: Keeps capital optimized, protects realized gains.
- **Functions**:
  - 15-min imbalance scans across venues.
  - Transfers capital along the cheapest path.
  - Cold wallet sweeps if ≥ £5k or ≥ 30% capital.
- **Sweep Options**: Daily / Monthly / None.
- **Destination**: Ledger cold wallet.
- **Schedule**: 15-min interval.

---

## 🚨 Alert Manager Agent (`alerts`)

- **Language**: Node.js
- **Role**: Sends notifications across channels.
- **Triggers**:
  - Panic activation.
  - Mode switching.
  - Latency spikes.
  - Daily loss thresholds.
- **Channels**:
  - Gmail SMTP
  - Telegram Bot
  - JSON Webhooks (Slack/Pushover ready)
- **Config**: `.env` or sealed-secrets.

---

## 🛡️ Risk Control Agent (`circuit-breaker`)

- **Language**: Java
- **Role**: Monitors risk signals, halts execution.
- **Triggers**:
  - Daily loss threshold exceeded.
  - Latency ceiling breach.
  - Win-rate below 40%.
- **Action**: Pauses trading cluster-wide until user resumes via dashboard.
- **Dashboard Control**: “Resume Trading” UI toggle.
- **Schedule**: Continuous sentinel.

---

## 🌐 API Gateway (`api`)

- **Language**: Node.js (Fastify)
- **Endpoints**:
  - `/opportunities`
  - `/settings`
  - `/metrics`
  - `/login`
- **Middleware**: JWT auth + input validation.
- **Serves**: SPA frontend + REST API.
- **Security**: HTTP-only cookies, sealed-secrets.

---

## 📊 UI Dashboard Agent (`dashboard`)

- **Language**: React (Node 18 build)
- **Features**:
  - Real-time charts (Prometheus feeds).
  - Mobile-friendly SPA (Safari/Chrome).
  - Settings: mode toggle, coin caps, panic resume.
  - JWT-authenticated access.
- **Dev Tools**: Storybook support.

---

## 📦 Storage + Messaging Agents

- **Postgres 16**:
  - Schema: `users`, `settings`, `trades`, `pnl_logs`
  - Durable audit + configuration backend.
- **Redis**:
  - Order book cache
  - pub/sub for feed + alerts
- **Prometheus + Grafana**:
  - Metrics exposure and live dashboarding.

---

## 🔐 Secrets + Compliance Agent

- **Sealed-Secrets** (Bitnami):
  - Encrypts API keys, email/passwords, tokens.
  - Git-safe + Kubernetes deployable.
- **TLS Everywhere**
- **AML/CGT UK Compliance Guide**
- **Cold Wallet Integration**

---

## 🧰 CI/CD Agent

- **Tools**: GitHub Actions + Podman
- **Checks**:
  - Jest (dashboard, api)
  - Gradle (executor)
  - PyTest (analytics)
  - Trivy CVE Scan
- **Deploy**:
  - Helm chart (replicas, ingress, secrets).
  - Push-button upgrades.

---

## 🔭 Observability Agent

- **Stack**:
  - Grafana (metrics)
  - Prometheus (scraper + time-series DB)
  - Loki (logs)
- **Grafana Dashboards**:
  - Trading performance and P&L
  - Exchange latency heatmaps
  - Node CPU/memory panels
- **Prometheus Endpoints**:
  - `/metrics` from API, executor, analytics
  - node_exporter for host metrics
- **Alert Integration**:
  - Alerts piped to Alert Manager Agent
  - Slack & Telegram notifications
