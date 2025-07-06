
# Alert Verification Guide – Prism Arbitrage

This document ensures the alerting and safety signal system is functioning prior to production.

---

## SMTP Setup Validation

1. Check `.env` or sealed secret:

```
SMTP_USER=alerts@example.com
SMTP_PASS=<app-password>
SMTP_HOST=smtp.example.com
```

2. Rebuild and restart API pod (if necessary)

3. Confirm logs show mailer startup:

```bash
kubectl logs deploy/api | grep SMTP
```

---

## Panic Brake Alert Test

1. Trigger a panic manually:

```bash
curl -X POST http://localhost:8080/api/test/panic
```

2. Expect:

   * Red dashboard banner
   * Email alert within 60 seconds

3. Confirm delivery:

   * Check inbox
   * Check spam folder

4. Inspect logs:

```bash
kubectl logs deploy/api | grep "Sending panic alert"
```

---

## Risk Threshold Violation Check

1. Submit unsafe config:

```bash
curl -X POST http://localhost:8080/api/config \
     -H "Content-Type: application/json" \
     -d '{"maxLoss": 99}'
```

2. Expected:

   * API rejects the request
   * Logs show:

     ```
     Unauthorized override attempt blocked: risk threshold violation
     ```

---

## Redis Pub/Sub Confirmation

1. Access Redis CLI:

```bash
kubectl exec -it deploy/redis -- redis-cli
```

2. Subscribe:

```bash
SUBSCRIBE control-feed
```

3. Trigger resume:

```bash
curl -X POST http://localhost:8080/api/test/resume
```

4. Expected message:

```
"message"
"control-feed"
"resume"
```

---

## Final Alert Checklist

* [ ] Panic alert email received
* [ ] Redis pub/sub confirmed working
* [ ] Log entries present for SMTP activity
* [ ] Invalid config attempts blocked
* [ ] Operators notified during simulated panic
