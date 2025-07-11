# Agents Overview

This document outlines the roles, responsibilities, and interfaces of each autonomous agent in the Crypto Arbitrage Platform.

---

## 1. Executor Agent (`/executor`)
- **Language**: Java (OpenJDK 17)
- **Purpose**: Real-time detection and execution of arbitrage trades.
- **Inputs**: Redis (price feeds), Postgres (bot settings).
- **Outputs**: Trade logs, PnL records to Postgres.
- **Triggers**: Spread threshold crossed, opportunity detected.
- **Dependencies**: Feed Aggregator, API Gateway.

---

## 2. API Gateway Agent (`/api`)
- **Language**: Node.js (Fastify)
- **Purpose**: REST interface for settings, auth, metrics, and opportunities.
- **Endpoints**:
  - `GET /opportunities`
  - `POST /settings`
  - `POST /login`
  - `GET /metrics`
- **Dependencies**: Redis, Postgres, Dashboard, Executor.

---

## 3. Dashboard Agent (`/dashboard`)
- **Language**: React (Node 18)
- **Purpose**: Mobile-friendly UI for control and monitoring.
- **Features**: Mode toggle, loss caps, latency caps, resume trading, charts.
- **Auth**: JWT via API Gateway.

---

## 4. Feed Aggregator Agent
- **Language**: Node.js or Python
- **Purpose**: WebSocket/REST aggregator for 10 CEXs and 4 DEXs.
- **Pushes to**: Redis pub/sub.
- **Special Handling**: Free-tier rate-limit compliance.
- **Active**: Runs continuously by default.

---

## 5. Rebalancer Agent
- **Language**: Java or Node
- **Purpose**: Rebalance hot wallet, sweep profits to cold wallet.
- **Rules**: Sweep if ≥ £5k or ≥ 30% NAV gain.
- **Trigger**: Every 15 minutes or manual from dashboard.
- **Outputs**: Cold-wallet transfer log.

---

## 6. Analytics Agent (`/analytics`)
- **Language**: Python (Flask + TensorFlow)
- **Purpose**: LSTM model for spread prediction, plus rolling PnL stats.
- **GPU**: Tesla P4 enabled.
- **Exposes**: `/predict`, Prometheus `/metrics`.

---

## 7. Alert Agent
- **Language**: Node.js or Python
- **Purpose**: Sends alerts via Gmail SMTP, Telegram, or Webhooks.
- **Triggers**:
  - Drawdown panic
  - Latency spike
  - Mode change
- **Creds**: Sealed secrets.

---

## 8. Circuit Breaker Agent
- **Language**: Node.js or Java
- **Purpose**: Halts trading when:
  - Daily loss % breached
  - P99 latency > threshold
  - Win-rate < threshold
- **Unpause**: Manual via dashboard.

---

## 9. Scheduler Agent
- **Purpose**: Triggers periodic jobs:
  - Rebalancer every 15m
  - Daily backups
  - Cold wallet sweep
- **Tooling**: Kubernetes CronJobs or node-cron.

---

## 10. Secret Manager Agent
- **Tooling**: `kubeseal`, `sealed-secrets`
- **Purpose**: Manage encrypted secrets for exchanges and alert services.
- **Runs in**: Kubernetes initContainer or entrypoint.

---
