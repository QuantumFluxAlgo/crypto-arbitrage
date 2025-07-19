# deployment-checklist.md

Use this list before promoting a new version to production.

- [ ] All tests pass via `githooks/pre-push`.
- [ ] Container images built and pushed to the registry.
- [ ] Helm chart values updated with new image tags.
- [ ] Secrets sealed and committed.
- [ ] `helm upgrade` executed with the correct release name.
- [ ] Post-deploy checks: `kubectl get pods`, dashboard loads, no errors in logs.
- [ ] Snapshot captured under `ops/snapshots/` for audit.
