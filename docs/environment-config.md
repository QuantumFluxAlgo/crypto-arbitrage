# Environment Configuration

The `.env.sandbox` file enables sandbox mode for local deployments.

```env
EXECUTION_MODE=sandbox
REDIS_URL=redis://default:testpassword@redis:6379
POSTGRES_URL=mocked
```

Use `cp .env.sandbox.example .env.sandbox` to start and then modify values as needed.
