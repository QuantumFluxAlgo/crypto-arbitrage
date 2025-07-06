
# Pre-Deployment Checklist for Prism Arbitrage

This checklist ensures Prism Arbitrage is ready for transition from dry-run to production deployment. Use this before every major release.

---

## 1. Secrets and Credentials

* [ ] Dummy secrets identified and removed from `.env` files
* [ ] Production secrets prepared in `prod-secret.yaml`
* [ ] `kubeseal` used to generate sealed Kubernetes secrets
* [ ] All secrets confirmed mounted via `kubectl describe pod`

---

## 2. Operator SOPs

* [ ] Panic brake recovery documented in `operator-runbook.md`
* [ ] Resume trading flow tested manually
* [ ] Wallet sweep behavior documented
* [ ] Redis and alert logs validated

---

## 3. Audit and Alerting

* [ ] Persistent logging enabled via volume or log forwarder
* [ ] SMTP credentials configured and tested
* [ ] Test alert triggered and received via email
* [ ] Log filters tested for `panic`, `resume`, and `unauthorized`

---

## 4. Helm Release and Rollback

* [ ] Helm chart version tagged (`1.0.0` or equivalent)
* [ ] Release installed using `helm install prism-prod ...`
* [ ] `helm history` reviewed post-deploy
* [ ] Snapshot captured under `/ops/snapshots/prism-prod-<version>`
* [ ] Rollback verified using `helm rollback prism-prod <rev>`

---

## 5. Final Validation

* [ ] Dashboard accessible and no panic state
* [ ] Prometheus and Grafana accessible and rendering metrics
* [ ] Redis pub/sub confirmed working
* [ ] Cold wallet sweep executes in dry-run with no real asset movement

---

## Artifact References

* `sealed-secret.yaml` — Production secrets
* `operator-runbook.md` — Runtime procedures
* `rollback-guide.md` — Rollback and release handling
* `alert-verification.md` — Alert system test checklist
