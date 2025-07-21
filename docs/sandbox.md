# Sandbox Setup Guide

Follow these steps to run the platform in sandbox mode without exposing real credentials.

## 1. Copy the Example Environment File

```bash
cp .env.sandbox.example .env.sandbox
```

Edit `.env.sandbox` and provide test-safe values. This file contains:

```env
API_KEY=your_value_here
REDIS_URL=your_url_here
EXECUTION_MODE=sandbox
```

## 2. Verify No Secrets Are Committed

Run the environment verifier before each commit:

```bash
bash test/verify-env.sh
```

The script fails if `.env.sandbox` or any other plaintext secrets are present in the repository.

## 3. Start Services in Sandbox Mode

Use the regular local development workflow. The services read `.env.sandbox` when `EXECUTION_MODE` is set to `sandbox`.

```bash
./scripts/builds.sh
podman-compose up
```

Refer to [docs/ops/phase-1-local.md](ops/phase-1-local.md) for full instructions on running the stack locally.
