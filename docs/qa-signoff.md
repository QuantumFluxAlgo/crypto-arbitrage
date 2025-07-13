# ✅ QA Signoff Checklist – Prism Arbitrage

Before pushing to `main`, ensure ALL items are ✅:

## Core Functionality

- [ ] Panic brake triggers with simulated loss
- [ ] Resume signal clears panic state
- [ ] Cold wallet sweep logs dry-run (no asset movement)
- [ ] Dashboard reflects current system state
- [ ] Redis and Postgres are healthy (no errors in logs)

## Config & Limits

- [ ] LOSS_CAP_PCT is ≤ 10%
- [ ] LATENCY_MAX_MS is ≤ 500ms
- [ ] All configs validated on startup

## Security

- [ ] SealedSecrets present and mounted in all pods
- [ ] No plaintext credentials or dummy API keys in repo

## Monitoring & Observability

- [ ] Prometheus `/metrics` endpoint is reachable
- [ ] Grafana shows real-time metrics
- [ ] Alerts fire on panic

## CI & Testing

- [ ] test/run-local.sh passes
- [ ] test/run-live.sh passes
- [ ] test-behavior.sh passes end-to-end checks

> 🛑 Don’t release unless every item is ✅.
