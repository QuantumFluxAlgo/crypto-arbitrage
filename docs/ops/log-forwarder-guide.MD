# Log Forwarder Setup

This guide explains how to forward container logs to Loki for centralized monitoring.

## Enabling Fluent Bit

Fluent Bit is enabled by default in `infra/helm/values.yaml`:
```yaml
logForwarder:
  enabled: true
  image: grafana/fluent-bit-plugin-loki:latest
```

1. Deploy the log forwarder:
   ```bash
   helm upgrade --install arb infra/helm -f infra/helm/values.yaml
   ```
2. Access Loki through Grafana to search logs across all services.

> **Warning**: Running without external storage like Loki will cause logs to
> accumulate locally and may exhaust disk space.

