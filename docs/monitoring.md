# Monitoring and Metrics

This platform exposes metrics for every service and uses StatusCake to monitor external availability.

## 1. StatusCake Uptime Checks

1. Sign in at <https://statuscake.com>.
2. Create HTTP tests for the dashboard (`http://YOUR_IP:3000`), API (`http://YOUR_IP:8080`), and analytics service (`http://YOUR_IP:5000`).
3. Add a **Contact Group** for your email or webhook and attach it to each test.
4. Optionally publish a public status page.

Set the following environment variables in your `.env.example` so automation scripts can update the tests:

```bash
STATUSCAKE_API_TOKEN=
STATUSCAKE_CONTACT_GROUP=
```

## 2. Prometheus Metrics

Prometheus scrapes mode-specific endpoints:
- `api` – `/api/metrics/live` or `/api/metrics/sandbox`
- `executor` – `/metrics`
- `analytics` – `/metrics`

To view them locally:

```bash
kubectl -n arbitrage port-forward svc/api 9100:8080 &
kubectl -n arbitrage port-forward svc/executor 9200:9100 &
kubectl -n arbitrage port-forward svc/analytics 9300:5000 &

curl http://localhost:9100/api/metrics/live
curl http://localhost:9100/api/metrics/sandbox
curl http://localhost:9200/metrics
curl http://localhost:9300/metrics
```

Grafana dashboards use these metrics for alert rules. Verify alerts by temporarily stopping a pod and confirming a notification is sent through StatusCake and Prometheus.
