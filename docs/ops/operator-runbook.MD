
# Operator Runbook – Prism Arbitrage

This document outlines the operational procedures for runtime control, safety actions, and recovery during panic events.

---

## Panic Brake Procedure

### Triggered Automatically

* Alert banner will appear in dashboard
* Logs will indicate cause (loss threshold, latency, fraud)

### Resume Steps

1. Log in to dashboard: `http://<ip>:3000`
2. Confirm cause via system status API:

   ```bash
   curl http://localhost:8080/api/system/status
   ```
3. Click "Resume Trading" in dashboard **or**

   ```bash
   curl -X POST http://localhost:8080/api/test/resume
   ```
4. Verify logs:

   ```bash
   kubectl logs deploy/executor | grep RESUME
   ```

---

## Cold Wallet Sweep (Dry-Run)

1. Trigger via dashboard or API:

   ```bash
   curl -X POST http://localhost:8080/api/test/sweep
   ```
2. Verify in logs:

   ```
   [DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.
   ```

---

## Redis Messaging Layer Check

1. Enter Redis pod:

   ```bash
   kubectl exec -it deploy/redis -- redis-cli
   ```
2. Subscribe to control channel:

   ```bash
   SUBSCRIBE control-feed
   ```
3. Trigger resume externally and observe output:

   ```
   "message"
   "control-feed"
   "resume"
   ```

---

## Log Collection and Filtering

Export logs:

```bash
kubectl logs deploy/api > logs/api.log
kubectl logs deploy/executor > logs/executor.log
```

Search for incidents:

```bash
grep "panic\|resume\|unauthorized" logs/*.log
```

Escalate suspicious logs to the security team immediately.

---

## Alerts & Email Checks

Trigger panic alert:

```bash
curl -X POST http://localhost:8080/api/test/panic
```

Expected email: Delivered to alert inbox within 60 seconds.

Check log:

```bash
kubectl logs deploy/api | grep "Sending panic alert"
```

---

## Final Operational Checklist

* [ ] Redis messaging confirmed
* [ ] Resume trading verified
* [ ] Cold wallet sweep simulated
* [ ] Panic alerts received via email
* [ ] All logs archived under `/logs`
