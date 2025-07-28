# Environment Configuration

All local development uses the `.env.sandbox` file found in the repository root. Copy the example to start:

```bash
cp .env.sandbox.example .env.sandbox
```

Default values:

```env
EXECUTION_MODE=sandbox
REDIS_URL=redis://default:testpassword@redis:6379
POSTGRES_URL=mocked
EXTERNAL_API_KEY=dummy
INTERNAL_TOKEN=test-token
```

Edit these values if needed. The sandbox mode does not connect to a real database. Redis requires the password `testpassword` and is exposed only inside the cluster.

Resource requests in `infra/helm/values.yaml` are already tuned for kind (10m CPU, 64Mi memory). Adjust them only if your VM has more capacity.
