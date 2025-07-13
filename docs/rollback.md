# Helm Rollback Guide

This guide explains how to revert a deployment using **Helm**. Ensure any database schema changes are backward compatible before rolling back.

---

## Step 1 – Check release history

List existing revisions so you know which one to roll back to:

```bash
helm history arb
```

---

## Step 2 – Perform the rollback

Specify the target revision from the previous command:

```bash
helm rollback arb <revision>
```

> **Warning**: Rolling back may fail if the target revision uses a different database schema. Confirm migrations are compatible before proceeding.

---

## Step 3 – Verify pod status

Make sure the pods are healthy after the rollback:

```bash
kubectl get pods
```

A `Running` status indicates the rollback succeeded.

---

## Step 4 – Record release snapshot

Before performing any rollback, capture the current deployment state for auditing:

```bash
helm get values arb > snapshots/$(date +%Y%m%d)-values.yaml
git rev-parse HEAD > snapshots/$(date +%Y%m%d)-commit.txt
```

Add any additional notes about the release to `snapshots/<date>-notes.txt`.
