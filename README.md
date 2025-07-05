# 🪙 Crypto Arbitrage

![CI](https://github.com/QuantumFluxAlgo/crypto-arbitrage/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Sentry](https://img.shields.io/badge/sentry-monitoring-orange)

---

## Overview

**Crypto Arbitrage** is a multi-agent platform that scans dozens of centralized and decentralized exchanges for price discrepancies and executes low-latency trades. Each service is containerized and communicates through Redis and PostgreSQL while metrics flow to Prometheus and Grafana.

---

## Features

- Real-time order book aggregation across 14 exchanges
- Java executor for sub-60µs trade execution
- REST API with JWT authentication
- React dashboard for live monitoring
- Predictive analytics with optional GPU acceleration
- Alerting and circuit breaking for risk management

---

## Architecture

```mermaid
graph TD
  FeedAggregator[Feed Aggregator] --> Redis[(Redis)]
  Redis --> Executor[Executor]
  Executor --> API[API Gateway]
  API --> Dashboard
  Executor --> Analytics
  Analytics --> Prometheus[(Prometheus)]
  Executor --> Postgres[(PostgreSQL)]
```

---

## Setup

1. Start Colima using the Podman runtime:
   ```bash
   colima start --runtime podman
   ```
2. Install dependencies and charts:
   ```bash
   helm dependency update infra/helm
   helm install arb infra/helm
   ```

---

## Envs & Secrets

Environment examples are provided in `api/.env.example` and `analytics/.env.example`. Secrets should be sealed with `kubeseal` before committing. Key variables include:

- `JWT_SECRET` – token signing key
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `SENTRY_DSN` for API error reporting
- `VITE_SENTRY_DSN` for dashboard errors

---

## Running Tests

- **Jest** for the dashboard and API:
  ```bash
  npx jest
  ```
- **PyTest** for analytics:
  ```bash
  pytest
  ```
- **Gradle** for the executor:
  ```bash
  ./gradlew test
  ```

---

## Monitoring

- **Sentry** captures runtime exceptions
- **Prometheus** scrapes metrics from all agents
- **StatusCake** monitors uptime of public endpoints

---

## Deployment

The platform runs on a Xeon host and is orchestrated by Kubernetes. Deploy or upgrade services using Helm charts located in `infra/helm`.

---

## License

Released under the [MIT](LICENSE) license.
