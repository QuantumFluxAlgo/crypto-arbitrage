🧠 Agents Overview – Prism Arbitrage
This defines all containerized agents and services deployed to the Prism Arbitrage Platform. All modules are CI-tested, Kubernetes-deployed, and sealed-secret secured. Real-time alerts, rollback controls, and monitoring integrations ensure operational safety and uptime.

🧠 Strategy Executor Agent (executor)
Language: Java 17 (Gradle)

Role: Detects spreads and executes arbitrage trades.

Functions:

Cross-exchange and triangular arbitrage.

Slippage validation and IOC execution.

Realized PnL, cold sweep, and rebalancer logic.

Panic Brake: loss > 3%, latency > 500ms, win rate < 40%.

Triggers: Redis spread-feed + control-feed.

Recovery: Resume handler via Redis.

Tests: JUnit + SLF4J logs.

Schedule: Continuous.
Codex-Driven Build Guid…

⚡ Exchange Feed Aggregator (feed-aggregator)
Language: Node.js 18

Role: Real-time feed collector from 10 CEXs + 4 DEXs.

Functions:

WebSocket ingestion + REST fallback.

Normalized feeds → Redis spread-feed.

Resilience: Auto-reconnect + rate-limit aware.
Crypto-Arbitrage Platfo…

🧮 Analytics + Predictive Agent (analytics)
Language: Python 3.10 + Flask + TensorFlow

Role: Predicts spread quality + tracks performance.

Functions:

Rolling metrics: PnL, Sharpe, hit rate.

LSTM model scoring (GPU-backed).

/predict and /metrics endpoints.

GPU: Tesla P4 via K8s plugin (nvidia.com/gpu: 1).
Codex-Driven Build Guid…

♻️ Rebalancer + ColdSweep Agent (rebalancer)
Language: Java (embedded in executor)

Role: Ensures capital efficiency + sweep protection.

Sweep Logic:

Profit ≥ £5k or ≥ 30% of NAV.

Transfers to cold wallet 0xTESTWALLET123.

Schedule: 15-minute rebalancer checks.
Codex-Driven Build Guid…

🚨 Alert Manager Agent (alerts)
Language: Node.js

Role: Notifies ops team on key events.

Channels:

Gmail SMTP

Telegram Bot

Webhooks (Slack, Pushover)

Triggers:

Panic state

Mode change

Loss/latency thresholds

Failover: Retries + multi-channel fallback.
Codex-Driven Build Guid…

🛡️ Circuit Breaker Agent (panic-brake)
Language: Java

Role: Sentinel enforcement of risk policies.

Conditions:

Daily loss > 3%

Avg latency > 500ms

Win rate < 40%

Recovery:

Redis control-feed or Dashboard toggle.

Schedule: Continuous.
Codex-Driven Build Guid…

🌐 API Gateway (api)
Language: Fastify (Node.js 18)

Endpoints:

/opportunities, /metrics, /settings, /login

Security:

JWT Auth + cookie sessions

Validated inputs, sealed-secret env

CI: Jest tests, Trivy scans, Sentry reporting.
Codex-Driven Build Guid…

📊 UI Dashboard (dashboard)
Language: React 18 + Vite + TailwindCSS

Features:

Realtime charts, win rate, latency, PnL

Settings control panel (mode, coin cap, loss limits)

“Resume Trading” toggle

Sentry-enabled error tracking

Access: JWT-auth SPA, mobile-friendly
Codex-Driven Build Guid…

📦 Data Layer Agents
PostgreSQL 16:

Tables: trades, near_misses, settings, users, pnl_logs

Redis:

Channels: spread-feed, control-feed

Purpose: fast message bus + in-memory cache

Prometheus + Grafana:

Visualized metrics across all services
Crypto-Arbitrage Platfo…

🔐 Secrets + Compliance Agent
SealedSecrets:

Encrypt API keys, email/passwords, tokens.

Git-safe, K8s-deployable secrets.

Compliance:

UK AML/CGT guide

TLS on all endpoints

Cold wallet sweep support
Codex-Driven Build Guid…

🧰 CI/CD Pipeline Agent
Stack: GitHub Actions + Podman + Helm

Tests:

Jest (dashboard/api), PyTest (analytics), Maven (executor)

Security:

Trivy CVE scans

SBOM (Syft)

Static analysis (eslint, flake8, checkstyle)

Deploy:

Unified deploy script (deploy-prod.sh)

Helm rollbacks + tagged GitHub releases
Codex-Driven Build Guid…

🔭 Observability Agent
Stack:

Prometheus /metrics across services

Grafana dashboards

Sentry (dashboard + API)

StatusCake (external uptime check)

Ops CLI:

ops-tools.sh for start/stop/status/logs/backup
Codex-Driven Build Guid…

📈 Mermaid Overview
mermaid
Copy
Edit
graph TD
  subgraph Market Data
    FeedAggregator[⚡ feed-aggregator]
    FeedAggregator -->|spread-feed| Redis
  end

  subgraph Core Logic
    Executor[🧠 executor]
    Analytics[🧮 analytics]
    Rebalancer[♻️ rebalancer (in executor)]
    PanicBrake[🛡️ panic-brake]
    Executor -->|Redis + DB| Postgres
    Executor --> Redis
    Executor -->|metrics| Prometheus
    Executor --> PanicBrake
    Analytics -->|/predict| Executor
    Analytics -->|/metrics| Prometheus
  end

  subgraph Control Layer
    Dashboard[📊 dashboard]
    API[🌐 api]
    Alerts[🚨 alerts]
    Secrets[🔐 sealed-secrets]
    Resume[Redis control-feed]
    Dashboard --> API
    API --> Executor
    API --> Alerts
    API --> Postgres
    API --> Prometheus
    Resume --> Executor
  end

  subgraph CI & Infra
    GitHub[🧰 CI/CD]
    Podman --> GitHub
    Helm --> GitHub
    GitHub -->|Build & Test| AllServices
    AllServices[All Agents]
  end

  subgraph Monitoring
    Grafana[📊 Grafana]
    Prometheus --> Grafana
    Dashboard --> Sentry
    API --> Sentry
    StatusCake[🌐 StatusCake] --> API
  end

  Redis[(📦 Redis)]
  Postgres[(📦 PostgreSQL)]
  Prometheus[(📈 Prometheus)]
