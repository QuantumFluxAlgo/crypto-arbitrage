# Helm Rollback Guide – Prism Arbitrage

This guide provides a step-by-step process for rolling back a Prism Arbitrage production deployment using Helm.

---

## 1. Identify Release

List current Helm releases:

```bash
helm list --all-namespaces
```

Expected release name: `prism-prod`

---

## 2. Review History

Display revision history:

```bash
helm history prism-prod
```

Example output:

```
REVISION  UPDATED                  STATUS     CHART            APP VERSION
1         2025-07-05 12:04:33      deployed   prism-arb-1.0.0  1.0.0
2         2025-07-06 10:17:58      deployed   prism-arb-1.1.0  1.1.0
```

---

## 3. Execute Rollback

To revert to previous working version:

```bash
helm rollback prism-prod 1
```

Verify status:

```bash
helm status prism-prod
```

---

## 4. Re-Test After Rollback

Run:

```bash
kubectl get pods
kubectl logs deploy/api
kubectl logs deploy/executor
```

Verify:

* Panic/resume logic behaves correctly
* Dashboard loads without error
* Alerts and sweep logic revert to expected state

---

## 5. Snapshot Best Practices

For each release, capture:

* `values.yaml` from Helm
* Git commit hash from repo:

  ```bash
  git rev-parse HEAD > commit.txt
  ```
* Any custom configuration changes in:

  * `api/.env`
  * `dashboard/config.json`

Store snapshots under:

```
/ops/snapshots/prism-prod-<version>/
├── values.yaml
├── commit.txt
└── notes.md
```

---

## Final Checklist

* [ ] Rollback tested using `helm rollback`
* [ ] Post-rollback tests passed
* [ ] Snapshot of each release committed to `/ops/snapshots`

