# Continuous Integration Guide

Every push is validated by GitHub Actions. The pipeline executes tests for each service, builds container images with Podman, and scans them with Trivy. Kubernetes manifests are linted with kubeconform and a dry‑run apply step ensures syntax validity.

The first job `verify-env` runs `test/verify-env.sh` which fails immediately if any plain `.env` files or unsealed `Secret` manifests are present. Run this script locally before committing:

```bash
bash test/verify-env.sh
```

To mimic the full workflow locally execute the individual test suites:

```bash
npm test --prefix api
npx jest --prefix dashboard
pytest feed-aggregator
pytest analytics
( cd executor && ./gradlew test )
```

If all tests pass and `verify-env.sh` reports no issues you can push your branch. GitHub Actions uses pinned commit SHAs for all actions so results are reproducible.
