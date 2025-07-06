# Phase 3: Post-Deployment Server Test Plan (Validation, Simulation, Observability)

**Purpose:**
This plan ensures the Prism Arbitrage system is deployed safely and performs as expected on your production VM. It includes panic brake simulations, runtime metrics verification, GPU availability, and readiness checks for operators — all in dry-run mode.

---

## 1. Confirm All Services Are Healthy

Check pod status:

```bash
kubectl get pods -o wide
```

Expected pods:

* `api`
* `dashboard`
* `executor`
* `analytics`
* `redis`
* (optional) `postgres`, `prometheus`, `grafana`

Check logs for startup health:

```bash
kubectl logs deploy/api
kubectl logs deploy/executor
kubectl logs deploy/analytics
```

Confirm readiness probes (if configured):

```bash
kubectl get pods -o jsonpath='{.items[*].status.containerStatuses[*].ready}'
```

---

## 2. Confirm GPU Availability and Plugin Health

Check that the Tesla P4 is available in Kubernetes:

```bash
kubectl describe node <your-node-name> | grep nvidia.com/gpu
```

Expected result:

```
nvidia.com/gpu: 1
```

Check logs from the NVIDIA plugin pod:

```bash
kubectl logs daemonset/nvidia-device-plugin-daemonset -n kube-system
```

---

## 3. Verify API Is Exposed

If no ingress controller:

```bash
kubectl port-forward svc/api 8080:8080
kubectl port-forward svc/dashboard 3000:3000
```

Access the dashboard:

```
http://localhost:3000
```

Confirm:

* Successful login
* Settings panel loads
* Trades simulated using dummy data
* Red panic brake banner is not visible

---

## 4. Test Panic Brake from Dashboard

Use the dashboard UI or call the test endpoint:

```bash
curl -X POST http://localhost:8080/api/test/panic --data '{"type":"loss", "value":9}'
```

Expected outcomes:

* Dashboard shows "Trading Paused"
* API logs show pause message
* Executor logs:

  ```
  [PANIC TRIGGERED] Trading halted due to simulated condition: -9.0%
  ```

---

## 5. Test Resume Trading

Via dashboard or API:

```bash
curl -X POST http://localhost:8080/api/test/resume
```

Expected:

* Dashboard state resumes
* Redis publishes resume signal
* Executor logs:

  ```
  [RESUME SIGNAL RECEIVED] Resuming trade evaluation
  ```

---

## 6. Validate Redis Messaging Layer

```bash
kubectl exec -it deploy/redis -- redis-cli
```

Subscribe:

```bash
SUBSCRIBE control-feed
```

Trigger resume in a separate terminal and confirm:

```
"message"
"control-feed"
"resume"
```

---

## 7. Confirm Cold Wallet Dry-Run Sweep

Trigger test sweep:

```bash
curl -X POST http://localhost:8080/api/test/sweep
```

Expected:

```
[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.
```

---

## 8. Validate Prometheus and Grafana

Confirm services:

```bash
kubectl get svc
```

Forward ports:

```bash
kubectl port-forward svc/prometheus 9090:9090
kubectl port-forward svc/grafana 3001:3000
```

Access dashboards:

* Prometheus: [http://localhost:9090](http://localhost:9090)
* Grafana: [http://localhost:3001](http://localhost:3001)

Grafana credentials:

* Username: `admin`
* Password: `admin`

Verify:

* CPU/memory usage
* Panic/resume events
* Trade simulation metrics

---

## 9. Safety and Risk Control Validation

From dashboard:

* Attempt to save unsafe thresholds
* Confirm rejected by API
* Confirm logs show:

  ```
  Unauthorized override attempt blocked: risk threshold violation
  ```

Verify all controls:

* Loss percentage cap
* Latency ceiling
* Cold wallet logic in dry-run mode

---

## 10. Final Operator Checklist

*

