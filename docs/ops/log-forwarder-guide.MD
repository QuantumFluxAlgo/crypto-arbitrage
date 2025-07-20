# Log Forwarder Setup

This guide explains how to forward container logs to Loki for centralized monitoring.

## Enabling Fluent Bit

1. Edit `infra/helm/values.yaml` and set:
   ```yaml
   logForwarder:
     enabled: true
     image: grafana/fluent-bit-plugin-loki:latest
   ```
2. Deploy the log forwarder:
   ```bash
   helm upgrade --install arb infra/helm -f infra/helm/values.yaml
   ```
3. Access Loki through Grafana to search logs across all services.
