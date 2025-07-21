# CI Setup

GitHub Actions validates every push and pull request. The workflow runs unit tests and `test/verify-env.sh` which fails the build if any plaintext `.env` files or unsealed Kubernetes secrets are present. Because of this policy pushes that violate the secret policy are automatically blocked.

To run the same checks locally:

```bash
bash test/verify-env.sh
```

This ensures your environment mirrors the CI gates before opening a pull request.

